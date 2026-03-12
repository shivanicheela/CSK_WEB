@echo off
echo Starting build...
cd /d "C:\Users\shiva\OneDrive\Desktop\CSK\react-app"
call npm run build
if %errorlevel% neq 0 (
  echo BUILD FAILED > "C:\Users\shiva\build_result.txt"
  exit /b 1
)
echo BUILD SUCCESS > "C:\Users\shiva\build_result.txt"
echo Build done! Now checking firebase...
where firebase >> "C:\Users\shiva\build_result.txt" 2>&1
echo SCRIPT COMPLETE >> "C:\Users\shiva\build_result.txt"

