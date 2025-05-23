const defaultLatexTemplate = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}


%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape Andrew Ryan}
\\end{center}


%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Brooklyn Technical High School}{Brooklyn, NY}
      {GPA 3.76, Class rank 63/350, SAT 1510}{Sept. 2021 -- Jun 2025}
  \\resumeSubHeadingListEnd


%-----------Extracurriculars-----------
\\section{Extracurricular Activities}
  \\resumeSubHeadingListStart

    \\resumeSubheading
      {Student Government}{Sept. 2023 -- Jun. 2024}
      {Treasurer}{Brooklyn, NY}
      \\resumeItemListStart
        \\resumeItem{Developed budget proposals, collaborating with the student government team to plan major school events.}
        \\resumeItem{Organized and led fundraising events, \\textbf{raising over \\$5,000} for school activities and projects.}
        \\resumeItem{Managed the student government budget, ensuring accurate tracking and allocation of funds.}
    
      \\resumeItemListEnd
      
    \\resumeSubheading
      {Math Team}{Sept. 2022 -- Present}
      {Team Captain}{Brooklyn, NY}
      \\resumeItemListStart
        \\resumeItem{Competed in regional, state, and national-level math competitions\\textbf{(NYCIML, NYCMTS).}}
        \\resumeItem{Facilitated weekly study sessions to discuss high-level \\textbf{Probability Theory, Geometry \\& Algebra.}}
        \\resumeItem{Led a 26-member math team as captain, overseeing strategy development and competition preparation.}
      \\resumeItemListEnd
    
    \\resumeSubheading
      {Varsity Swim Team}{Sep. 2021 -- June 2024}
      {Team Captain}{Brooklyn, NY}
      \\resumeItemListStart
        \\resumeItem{Led the varsity swim team to its \\textbf{inaugural section championship} through leadership and strategic planning.}
        \\resumeItem{Mentored junior team members, providing guidance on proper techniques, race preparation, and sportsmanship.}
    \\resumeItemListEnd

  \\resumeSubHeadingListEnd


%-----------Experience-----------
\\section{Experience}
  \\resumeSubHeadingListStart

    \\resumeSubheading
      {FlexiDip}{June 2024 -- Present}
      {Co-Founder}{Ann Arbor, MI}
      \\resumeItemListStart
        \\resumeItem{\\textbf{Co-founded startup} specializing in adjustable dipping containers, optimizing buffalo wing dining experience.}
        \\resumeItem{Developed minimum viable product(MVP) capable of early-stage revenue generation.}
        \\resumeItem{Received positive feedback from established brands like Buffalo Wild Wings for innovative sauce holder designs.}
        \\resumeItem{Validated startup idea through market research and interview feedback as a part of Launch-X U-Michigan.}
      \\resumeItemListEnd
      
    \\resumeSubheading
      {Private Math Tutor}{Sept. 2021 -- Present}
      {Team Captain}{Brooklyn, NY}
      \\resumeItemListStart
        \\resumeItem{Provided personalized tutoring sessions in algebra, calculus, and geometry to elementary \\& middle-school students}
        \\resumeItem{Developed lesson plans for diverse learning styles, leading to improvements by \\textbf{upwards of 1.5 letter grades}.}
        \\resumeItemListEnd

  \\resumeSubHeadingListEnd


\\section{Awards}
    \\resumeSubHeadingListStart
      \\resumeSubheading
      {Speedo Scholastic All-American}{Aug. 2023 -- Present}
      {}{}
      \\resumeItemListStart
      \\vspace{-4mm}
        \\resumeItem{National award given to student-athletes who achieve a \\textbf{national time standard }while maintaining a 3.5+ GPA.}
      \\resumeItemListEnd
      
    \\resumeSubheading
      {National Junior Honor Society}{June 2023 -- Present}
      {}{}
      \\resumeItemListStart
      \\vspace{-4mm}
        \\resumeItem{Award presented to students with outstanding achievements in academics, leadership, and community service.}
      \\resumeItemListEnd
    \\resumeSubHeadingListEnd

%-----------Courses-----------
\\section{Classes}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    \\vspace{1mm}
     \\textbf{Courses}{: AP Calulus BC, AP Chemistry, AP Physics, AP World History, AP U.S. History, AP Statistics, AP Literature} \\\\

    }}
 \\end{itemize}

%-----------Skill and Interests-----------
\\section{Skills \\& Interests}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    \\vspace{1mm}
     \\textbf{Skills}{: Probability Theory, Web Design, Microsoft Excel, Microsoft Office} \\\\
     \\vspace{1mm}
     \\textbf{Interests}{: Photography, Creative Writing, Archery, New York Knicks} \\\\
     \\vspace{1mm}

    }}
 \\end{itemize}
 \\begin{center}
    
\\small 123-456-7890 $|$
\\href{mailto:ADD EMAIL HERE@x.com}{\\underline{andrew@gmail.com}} $|$
\\href{ADD LINKEDIN PAGE HERE}{\\underline{linkedin.com/in/andrew}} 
\\end{center}


\\end{document}`;

export default defaultLatexTemplate;
