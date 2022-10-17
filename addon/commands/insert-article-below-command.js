import { v4 as uuid } from 'uuid';
import { structureTypes } from '../utils/constants';

export default class InsertArticleBelowCommand {
  name = 'insert-article-below';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, selectedArticleUri, articleContent, options) {
    const articleSubjectNode = controller.datastore
      .match(`>${selectedArticleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const articleNode = [...articleSubjectNode.nodes][0];
    const articleContainer = articleNode.parent;
    const articles = articleContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const articleIndex = articles.findIndex(
      (article) => article === articleNode
    );
    const insertRange = controller.rangeFactory.fromInNode(
      articleContainer,
      articleIndex + 1,
      articleIndex + 1
    );
    const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
    const articleHtml = `
      <div property="say:hasPart" typeof="say:Article" resource="${articleUri}">
        <div property="say:heading">
          Artikel 
          <span property="eli:number" datatype="xsd:string"> 
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="say:body" datatype='rdf:XMLLiteral'>
        ${
          articleContent
            ? articleContent
            : '<span class="mark-highlight-manual">Voer inhoud in</span>'
        }
        </div>
      </div>
    `;
    controller.executeCommand('insert-html', articleHtml, insertRange);
    controller.executeCommand('recalculate-article-numbers', controller);
  }
  removeZeroWidthSpace(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
}
