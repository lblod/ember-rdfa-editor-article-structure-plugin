import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  plugins = [
    {
      name: 'article-structure',
      options: {
        rdfaContainer: 'http://test/myTestContainer',
      },
    },
  ];

  @action
  rdfaEditorInit(controller) {
    const presetContent = `
      <div prefix="dct: http://purl.org/dc/terms/ ext: http://mu.semte.ch/vocabularies/ext/ say: https://say.data.gift/ns/">
        Insert here
      </div>`;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
