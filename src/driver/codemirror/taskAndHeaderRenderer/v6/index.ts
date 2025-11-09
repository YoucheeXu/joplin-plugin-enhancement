import checklistPlugin from './checklistPlugin';
import { headingExtension } from "./headingExtension";

const taskAndHeaderRenderer = () => {
    return [
      checklistPlugin(),
      headingExtension
    ];
};

export default taskAndHeaderRenderer;