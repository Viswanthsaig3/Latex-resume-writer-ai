const defaultLatexTemplate = `\\documentclass{article}

\\title{Simple Resume}
\\author{John Doe}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Contact Information}
Email: john.doe@example.com \\\\
Phone: (123) 456-7890 \\\\
LinkedIn: linkedin.com/in/johndoe

\\section{Education}
\\textbf{University Name}, City, State \\\\
Bachelor of Science in Computer Science \\\\
2018-2022

\\section{Experience}
\\textbf{Software Engineer} \\\\
Company Name, City, State \\\\
2022-Present
\\begin{itemize}
  \\item Developed full-stack web applications using modern technologies
  \\item Collaborated with cross-functional teams to deliver projects on time
  \\item Optimized database queries resulting in 30\\% performance improvement
\\end{itemize}

\\section{Skills}
\\begin{itemize}
  \\item Programming Languages: JavaScript, Python, Java
  \\item Web Development: React, Node.js, HTML, CSS
  \\item Databases: PostgreSQL, MongoDB
  \\item Tools: Git, Docker, AWS
\\end{itemize}

\\end{document}`;

export default defaultLatexTemplate;
