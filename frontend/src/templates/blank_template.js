const blankTemplate = `\\documentclass{article}
\\usepackage[letterpaper,margin=0.75in]{geometry}
\\usepackage{hyperref}

\\begin{document}

% Your resume content goes here
% Start by replacing this with your information

\\begin{center}
  \\textbf{\\LARGE Your Name}\\\\
  \\vspace{0.1in}
  Your Address \\textbullet{} City, State ZIP\\\\
  Phone: (123) 456-7890 \\textbullet{} Email: your.email@example.com\\\\
  LinkedIn: linkedin.com/in/yourname \\textbullet{} GitHub: github.com/yourusername
\\end{center}

\\section*{Education}
% Example:
% \\textbf{University Name} \\hfill City, State\\\\
% Degree Program \\hfill Graduation Date\\\\
% GPA: X.XX/4.00

\\section*{Experience}
% Example:
% \\textbf{Job Title} \\hfill Start Date -- End Date\\\\
% Company Name \\hfill City, State\\\\
% \\begin{itemize}
%   \\item Description of accomplishment or responsibility
% \\end{itemize}

\\section*{Skills}
% Example:
% \\textbf{Programming Languages:} Java, Python, JavaScript, etc.\\\\
% \\textbf{Technologies:} React, Node.js, Docker, etc.

\\section*{Projects}
% Example:
% \\textbf{Project Name} \\hfill Date\\\\
% \\begin{itemize}
%   \\item Description of project and your contributions
% \\end{itemize}

\\section*{Certifications}
% Example:
% \\textbf{Certification Name} \\hfill Date Obtained\\\\
% Issuing Organization

\\end{document}`;

export default blankTemplate;
