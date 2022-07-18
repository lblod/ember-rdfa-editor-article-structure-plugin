import { v4 as uuid } from 'uuid';

export default class InsertParagraphCommand {
  name = 'insert-paragraph';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, articleUri, options) {
    const articleContentObjectNode = controller.datastore
      .match(`>${articleUri}`, '>https://say.data.gift/ns/body', null)
      .asObjectNodes()
      .next().value;
    const articleContentElement = [...articleContentObjectNode.nodes].find(
      (node) => node.getAttribute('property') === 'say:body'
    );
    const paragraphUuid =
      options && options.isTemplate ? '${generateUuid()}' : uuid();
    const paragraphUri = `http://data.lblod.info/paragraph/${paragraphUuid}`;
    if (
      articleContentElement.children.length > 1 ||
      articleContentElement.children[0].attributeMap.get('typeof') ===
        'say:Paragraph'
    ) {
      const paragraphHtml = `
        <div property="say:hasParagraph" typeof="say:Paragraph" resource="${paragraphUri}">
          §<span property="eli:number" datatype="xsd:string">${this.generateParagraphNumber(
            articleContentElement
          )}</span>.
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      `;
      controller.executeCommand(
        'insert-html',
        paragraphHtml,
        controller.rangeFactory.fromInElement(
          articleContentElement,
          articleContentElement.getMaxOffset(),
          articleContentElement.getMaxOffset()
        )
      );
    } else {
      const paragraphHtml = `
        <div property="say:hasParagraph" typeof="say:Paragraph" resource="${paragraphUri}">
          §<span property="eli:number" datatype="xsd:string">1</span>. 
        </div>
      `;
      const children = [...articleContentElement.children];
      controller.executeCommand(
        'insert-html',
        paragraphHtml,
        controller.rangeFactory.fromInElement(
          articleContentElement,
          0,
          articleContentElement.getMaxOffset()
        )
      );
      const paragraphInserted = [
        ...controller.datastore
          .match(`>${paragraphUri}`, null, null)
          .asSubjectNodes()
          .next().value.nodes,
      ][0];
      const rangeToInsertContent = controller.rangeFactory.fromInNode(
        paragraphInserted,
        paragraphInserted.getMaxOffset(),
        paragraphInserted.getMaxOffset()
      );
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsertContent, ...children);
      });
      return;
    }
    const newParagraphElementSubjectNodes = controller.datastore
      .match(`>${paragraphUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    if (newParagraphElementSubjectNodes) {
      const newParagraphElement = [...newParagraphElementSubjectNodes.nodes][0];
      const range = controller.rangeFactory.fromInElement(
        newParagraphElement,
        1,
        1
      );
      this.model.change(() => {
        controller.selection.selectRange(range);
      });
    }
  }
  generateParagraphNumber(container) {
    const substructures = container.children.filter(
      (node) => node.getAttribute('typeof') === 'say:Paragraph'
    );
    return substructures.length + 1;
  }
}
