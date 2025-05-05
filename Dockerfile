FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install minimal TeX Live environment (much smaller than texlive-full)
RUN apt-get update && apt-get install -y \
    texlive-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a working directory for LaTeX compilation
WORKDIR /data

# Add a label for identification
LABEL org.opencontainers.image.description="Minimal LaTeX environment for resume compilation"
LABEL org.opencontainers.image.source="https://github.com/username/latex-resume-writer"

# Test the LaTeX installation
RUN echo '\documentclass{article}\begin{document}Hello World!\end{document}' > test.tex && \
    pdflatex test.tex && \
    rm test.* && \
    echo "LaTeX installation verified"

# Set default command (can be overridden)
CMD ["pdflatex", "-interaction=nonstopmode"]
