FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install enhanced TeX Live environment for resume building
RUN apt-get update && apt-get install -y \
    texlive-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-fonts-extra \
    texlive-xetex \
    texlive-luatex \
    texlive-pictures \
    texlive-science \
    latexmk \
    curl \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Create a working directory for LaTeX compilation
WORKDIR /data

# Add a label for identification
LABEL org.opencontainers.image.description="Enhanced LaTeX environment for resume compilation"
LABEL org.opencontainers.image.source="https://github.com/username/latex-resume-writer"

# Test the LaTeX installation
RUN echo '\documentclass{article}\begin{document}Hello World!\end{document}' > test.tex && \
    pdflatex test.tex && \
    rm test.* && \
    echo "LaTeX installation verified"

# Set default command (can be overridden)
CMD ["latexmk", "-pdf", "-interaction=nonstopmode"]
