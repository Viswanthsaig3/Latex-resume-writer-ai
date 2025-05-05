@echo off
cd /d "%~dp0"
echo Building local Docker LaTeX image from %CD%...
echo Current directory: %CD%

if not exist Dockerfile (
  echo ERROR: Dockerfile not found in current directory.
  echo Creating minimal Dockerfile...
  
  (
    echo FROM ubuntu:22.04
    echo.
    echo # Avoid interactive prompts during package installation
    echo ENV DEBIAN_FRONTEND=noninteractive
    echo.
    echo # Install minimal TeX Live environment
    echo RUN apt-get update ^&^& apt-get install -y \
    echo     texlive-base \
    echo     texlive-latex-recommended \
    echo     texlive-fonts-recommended \
    echo     texlive-latex-extra \
    echo     curl \
    echo     ^&^& rm -rf /var/lib/apt/lists/*
    echo.
    echo # Create a working directory for LaTeX compilation
    echo WORKDIR /data
    echo.
    echo # Test the LaTeX installation
    echo RUN echo '\documentclass{article}\begin{document}Hello World!\end{document}' ^> test.tex ^&^& \
    echo     pdflatex test.tex ^&^& \
    echo     rm test.* ^&^& \
    echo     echo "LaTeX installation verified"
    echo.
    echo # Set default command
    echo CMD ["pdflatex", "-interaction=nonstopmode"]
  ) > Dockerfile
  
  echo Created new Dockerfile.
)

echo Starting Docker build process...
docker build -t local-latex-env .

if %ERRORLEVEL% neq 0 (
  echo Error: Failed to build Docker image. Using blang/latex instead.
  echo Trying to pull blang/latex image...
  docker pull blang/latex
) else (
  echo Successfully built local-latex-env Docker image!
)

echo.
echo Testing Docker image...
mkdir test-output 2>nul
echo \documentclass{article}\begin{document}Hello World!\end{document} > test-output\test.tex

if exist local-latex-env (
  echo Testing local image...
  docker run --rm -v "%cd%/test-output:/data" local-latex-env pdflatex test.tex
) else (
  echo Testing blang/latex image...
  docker run --rm -v "%cd%/test-output:/data" blang/latex pdflatex test.tex
)

if exist test-output\test.pdf (
  echo TEST SUCCESSFUL: PDF was generated!
) else (
  echo TEST FAILED: No PDF was generated.
)

echo Cleaning up test files...
if exist test-output rmdir /s /q test-output

pause
