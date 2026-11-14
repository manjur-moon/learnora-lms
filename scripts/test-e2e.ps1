# Local end-to-end API checks against a RUNNING LOCAL Express + PostgreSQL backend.
# Creates a temporary course and lectures; cleans up before exiting wherever possible.
# Run in PowerShell from project root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-e2e.ps1
# Never run against important production data.
param([string]$ApiBase = "http://localhost:5000")
$ErrorActionPreference = "Stop"
$uri = [Uri]$ApiBase
if ($uri.Host -notin @('localhost', '127.0.0.1')) {
  throw "Safety restriction: Integration tests may only target localhost or 127.0.0.1."
}
$base = $ApiBase.TrimEnd('/')
$courseId = $null
$adminSession = $null
$passed = 0

function Pass([string]$message) {
  $script:passed++
  Write-Host "PASS $message" -ForegroundColor Green
}
function Assert([bool]$condition, [string]$message) {
  if (-not $condition) { throw "FAIL: $message" }
  Pass $message
}
function ExpectStatus([int]$expected, [string]$label, [string]$url, [string]$method = 'GET', [string]$body = $null, [bool]$authenticated = $false) {
  $opts = @{ Uri = $url; Method = $method; ErrorAction = 'Stop' }
  if ($authenticated) { $opts['WebSession'] = $script:adminSession }
  if ($null -ne $body) { $opts['Body'] = $body; $opts['ContentType'] = 'application/json' }
  try {
    $null = Invoke-RestMethod @opts
    throw "Expected HTTP $expected for $label, but request succeeded"
  } catch {
    $response = $_.Exception.Response
    if (-not $response) { throw }
    $actual = [int]$response.StatusCode
    if ($actual -ne $expected) { throw "Expected HTTP $expected for $label; received HTTP $actual" }
    Pass "$label (HTTP $actual)"
  }
}

try {
  Write-Host "Checking local backend: $base" -ForegroundColor Cyan
  $health = Invoke-RestMethod "$base/api/health"
  Assert ($health.success -eq $true -and $health.data.database -eq 'connected') 'Backend and PostgreSQL health'
  $publicList = Invoke-RestMethod "$base/api/courses"
  Assert ($publicList.success -eq $true) 'Public course listing'
  ExpectStatus 400 'Reject malformed course ID' "$base/api/courses/not-a-uuid"
  ExpectStatus 401 'Reject anonymous admin access' "$base/api/admin/me"
  ExpectStatus 401 'Reject anonymous course creation' "$base/api/admin/courses" 'POST' '{"title":"Not authorized"}'

  $credential = Get-Credential -Message 'Enter your provisioned LMS test administrator email and password'
  if (-not $credential) { throw 'Admin credentials are required.' }
  $loginJson = @{ email = $credential.UserName; password = $credential.GetNetworkCredential().Password } | ConvertTo-Json
  try {
    $null = Invoke-RestMethod -Uri "$base/api/auth/sign-in/email" -Method POST -ContentType 'application/json' -Body $loginJson -SessionVariable adminSession
  } finally {
    Remove-Variable credential, loginJson -ErrorAction SilentlyContinue
  }
  Assert ($null -ne $adminSession) 'Administrator login session created'
  $me = Invoke-RestMethod -Uri "$base/api/admin/me" -WebSession $adminSession
  Assert ($me.success -eq $true) 'Admin authorization passes'

  # Check validation before writing test data.
  $invalidCourse = @{ title = 'Invalid Course'; description = 'This has a negative price.'; price = -1; thumbnailUrl = 'https://example.com/a.jpg' } | ConvertTo-Json
  ExpectStatus 400 'Reject negative course price' "$base/api/admin/courses" 'POST' $invalidCourse $true
  $unknown = @{ title = 'JS'; description = 'Too short'; price = 0; thumbnailUrl = 'not-a-url'; role = 'admin' } | ConvertTo-Json
  ExpectStatus 400 'Reject malformed/extra course fields' "$base/api/admin/courses" 'POST' $unknown $true

  $newCourse = @{ title = 'Learnora E2E Test'; description = 'Temporary course used by the local Local end-to-end QA workflow.'; price = 1500; thumbnailUrl = 'https://example.com/e2e-cover.jpg' } | ConvertTo-Json
  $course = Invoke-RestMethod -Uri "$base/api/admin/courses" -WebSession $adminSession -Method POST -ContentType 'application/json' -Body $newCourse
  $courseId = [string]$course.data._id
  Assert ($courseId -match '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') 'Admin creates a persistent course'

  $readCourse = Invoke-RestMethod "$base/api/courses/$courseId"
  Assert ($readCourse.data._id -eq $courseId) 'Student can retrieve the created course'
  $coursePatch = @{ price = 1800 } | ConvertTo-Json
  $updated = Invoke-RestMethod -Uri "$base/api/admin/courses/$courseId" -WebSession $adminSession -Method PATCH -ContentType 'application/json' -Body $coursePatch
  Assert ($updated.data.price -eq 1800) 'Admin updates course price'
  ExpectStatus 400 'Reject empty course update' "$base/api/admin/courses/$courseId" 'PATCH' '{}' $true

  $newLecture = @{ title = 'QA Lecture One'; description = 'A temporary lecture for local end-to-end testing.'; videoUrl = 'https://www.youtube.com/watch?v=j942wKiXFu8'; order = 1 } | ConvertTo-Json
  $lecture = Invoke-RestMethod -Uri "$base/api/admin/courses/$courseId/lectures" -WebSession $adminSession -Method POST -ContentType 'application/json' -Body $newLecture
  $lectureId = [string]$lecture.data._id
  Assert ($lectureId -match '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') 'Admin creates a lecture under the course'

  $publicLectures = Invoke-RestMethod "$base/api/courses/$courseId/lectures"
  Assert (@($publicLectures.data).Count -eq 1 -and $publicLectures.data[0].courseId -eq $courseId) 'Student can retrieve associated lectures'
  $updatedLecture = Invoke-RestMethod -Uri "$base/api/admin/courses/$courseId/lectures/$lectureId" -WebSession $adminSession -Method PATCH -ContentType 'application/json' -Body '{"title":"QA Lecture Updated","order":2}'
  Assert ($updatedLecture.data.title -eq 'QA Lecture Updated' -and $updatedLecture.data.order -eq 2) 'Admin updates a lecture'
  ExpectStatus 404 'Reject lecture lookup under wrong parent' "$base/api/admin/courses/00000000-0000-4000-8000-000000000001/lectures/$lectureId" 'PATCH' '{"order":3}' $true

  # Keep this lecture present to exercise the transactional cascade path.
  $null = Invoke-RestMethod -Uri "$base/api/admin/courses/$courseId" -WebSession $adminSession -Method DELETE
  $courseId = $null
  Pass 'Admin deletes course (transactional cascade path executed)'
  ExpectStatus 404 'Deleted course unavailable to students' "$base/api/courses/$($course.data._id)"
  # PostgreSQL FK ON DELETE CASCADE removes dependent lectures automatically.
  Write-Host 'NOTE: FK ON DELETE CASCADE protects against orphan lectures.' -ForegroundColor Yellow
  $null = Invoke-RestMethod -Uri "$base/api/auth/sign-out" -Method POST -ContentType 'application/json' -Body '{}' -WebSession $adminSession
  ExpectStatus 401 'Logout invalidates admin session' "$base/api/admin/me" 'GET' $null $true
  Write-Host "LMS local API workflow passed: $passed checks." -ForegroundColor Green
} catch {
  Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
} finally {
  if ($courseId -and $adminSession) {
    try {
      $null = Invoke-RestMethod -Uri "$base/api/admin/courses/$courseId" -Method DELETE -WebSession $adminSession
      Write-Host "Cleaned up temporary test course $courseId" -ForegroundColor Yellow
    } catch {
      Write-Host "WARNING: Temporary course $courseId may remain; inspect PostgreSQL and remove it manually." -ForegroundColor Yellow
    }
  }
}
