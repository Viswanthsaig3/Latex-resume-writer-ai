import defaultTemplate from './default';
import jakeResumeTemplate from './jake_resume';
import blankTemplate from './blank_template';

// Collection of all available templates
const templates = {
  default: {
    name: "Simple Resume",
    description: "Basic resume layout suitable for most job applications",
    template: defaultTemplate
  },
  jake: {
    name: "ATS-Friendly Resume",
    description: "Clean, well-structured format optimized for ATS systems",
    template: jakeResumeTemplate
  },
  blank: {
    name: "Blank Template",
    description: "Start from scratch with a customizable blank template",
    template: blankTemplate
  }
};

export default templates;
