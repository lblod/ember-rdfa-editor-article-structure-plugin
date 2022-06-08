import { v4 as uuid } from 'uuid';

export default class InsertParagraphCommand {
  name = 'insert-paragraph';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, articleUri) {
    const articleContentObjectNode = controller.datastore
      .match(`>${articleUri}`, '>http://www.w3.org/ns/prov#value', null)
      .asObjectNodes()
      .next().value;
    const articleContentElement = [...articleContentObjectNode.nodes][0];
    const paragraphUri = `http://data.lblod.info/paragraph/${uuid()}`;
    console.log(articleContentElement);
    if (
      articleContentElement.children.length > 1 ||
      articleContentElement.children[0].attributeMap.get('typeof') ===
        'ext:Paragraph'
    ) {
      const paragraphHtml = `
        <div property="ext:hasParagraph" typeof="ext:Paragraph" resource="${paragraphUri}">
          §
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
        <div property="ext:hasParagraph" typeof="ext:Paragraph" resource="${paragraphUri}">
          § ${articleContentElement.innerHtml}
        </div>
      `;
      controller.executeCommand(
        'insert-html',
        paragraphHtml,
        controller.rangeFactory.fromInElement(
          articleContentElement,
          0,
          articleContentElement.getMaxOffset()
        )
      );
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
}
