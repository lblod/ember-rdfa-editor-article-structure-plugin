import Controller from '@ember/controller';
import { action } from '@ember/object';

const testContainerFind = (limitedDatastore) => {
  const containerSubjectNode = limitedDatastore
    .match(null, 'a', '>http://test/myTestContainer')
    .asSubjectNodes()
    .next().value;
  const container = [...containerSubjectNode.nodes][0];
  return container;
}

const besluitFind = (limitedDatastore) => {
  const besluitQuad = limitedDatastore
    .match(null, 'a', 'besluit:Besluit')
    .asQuads()
    .next().value;
  const containerSubjectNode = limitedDatastore
    .match(`>${besluitQuad.subject.value}`, 'prov:value', null)
    .asPredicateNodes()
    .next().value;
  const container = [...containerSubjectNode.nodes][0];
  return container;
}

export default class ApplicationController extends Controller {
  plugins = [
    {
      name: 'article-structure',
      options: {
        findStructureContainer: testContainerFind,
        hasPartPredicate: 'eli:has_part',
        articleType: 'http://data.vlaanderen.be/ns/besluit#Artikel',
        structures: ['chapter', 'title'],
      },
    },
  ];

  @action
  rdfaEditorInit(controller) {
    const presetContent = `
      <div prefix="dct: http://purl.org/dc/terms/ ext: http://mu.semte.ch/vocabularies/ext/ say: https://say.data.gift/ns/">
        <div typeof="http://test/myTestContainer">
          Insert here
        </div>
      </div>`;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
