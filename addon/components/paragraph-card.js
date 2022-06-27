import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsParagraphCardComponent extends Component {
  @tracked isOutsideParagraph = true;
  @tracked paragrahUri = undefined;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  moveParagraph(moveUp) {
    this.args.controller.executeCommand(
      'move-paragraph',
      this.args.controller,
      this.paragrahUri,
      moveUp
    );
  }
  @action
  selectionChangedHandler() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );

    const paragraph = limitedDatastore
      .match(null, 'a', 'ext:Paragraph')
      .asQuads()
      .next().value;
    console.log(paragraph);
    if (!paragraph) {
      this.isOutsideParagraph = true;
      this.paragrahUri = undefined;
    } else {
      this.isOutsideParagraph = false;
      this.paragrahUri = paragraph.subject.value;
    }
  }
}
