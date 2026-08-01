import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import './style.css';

import {
  initInspectToggle,
  initGridToggle,
  initFPSMeter,
  initBoundingBoxOverlay,
} from './inspect.js';
import { initSkillGraph } from './skillGraph.js';
import { initDeployForm } from './deploy.js';

initInspectToggle();
initGridToggle();
initFPSMeter();
initBoundingBoxOverlay();
initSkillGraph('skill-canvas');
initDeployForm();
