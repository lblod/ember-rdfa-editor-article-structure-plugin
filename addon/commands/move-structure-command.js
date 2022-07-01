import { STRUCTURES, structureTypes } from '../utils/constants';

export default class MoveStructureCommand {
  name = 'move-structure';

  constructor(model) {
    this.model = model;
  }

  canExecute(controller, structureUri, moveUp) {
    const structureSubjectNode = controller.datastore
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const structureNode = [...structureSubjectNode.nodes][0];
    const structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      return true;
    } else {
      const currentStructureType = controller.datastore
        .match(`>${structureUri}`, 'a', null)
        .asQuads()
        .next().value.object.value;
      const currentStructureIndex = STRUCTURES.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const parentStructure = STRUCTURES[currentStructureIndex - 1];
      if (!parentStructure) {
        return false;
      }
      const treeWalker = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: structureNode,
        end: controller.modelRoot,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureType = node.getAttribute('typeof');
            if (structureType === parentStructure.type) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        return true;
      } else {
        return false;
      }
    }
  }

  execute(controller, structureUri, moveUp) {
    const structureSubjectNode = controller.datastore
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const structureNode = [...structureSubjectNode.nodes][0];
    const structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    const currentStructureType = controller.datastore
      .match(`>${structureUri}`, 'a', null)
      .asQuads()
      .next().value.object.value;
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      const structureA = structures[structureIndex];
      const bIndex = moveUp ? structureIndex - 1 : structureIndex + 1;
      const structureB = structures[bIndex];

      const structureARange =
        controller.rangeFactory.fromAroundNode(structureA);
      const structureBRange =
        controller.rangeFactory.fromAroundNode(structureB);
      const structureAToInsert = structureA.clone();
      const structureBToInsert = structureB.clone();
      this.model.change((mutator) => {
        mutator.insertNodes(structureBRange, structureAToInsert);
        mutator.insertNodes(structureARange, structureBToInsert);
      });
      controller.executeCommand(
        'recalculate-structure-numbers',
        controller,
        structureContainer,
        currentStructureType
      );
      this.model.change(() => {
        const heading = structureAToInsert.children.find(
          (child) => child.getAttribute('property') === 'say:heading'
        );
        const range = controller.rangeFactory.fromInElement(heading, 0, 0);
        controller.selection.selectRange(range);
      });
    } else {
      // Find next parent structure up the chain
      const currentStructureIndex = STRUCTURES.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const parentStructure = STRUCTURES[currentStructureIndex - 1];
      const treeWalker = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: structureNode,
        end: controller.modelRoot,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureType = node.getAttribute('typeof');
            if (structureType === parentStructure.type) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        //Insert structure last place in that structure
        const structureContent = nodeToInsert.children.filter(
          (child) => child.getAttribute('property') === 'say:body'
        )[0];
        let insertRange;
        if (
          structureContent.children.length === 1 &&
          structureContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            0,
            structureContent.getMaxOffset()
          );
        } else {
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            structureContent.getMaxOffset(),
            structureContent.getMaxOffset()
          );
        }
        const originalContainer = structureNode.parent;
        const insertStructure = structureNode.clone();
        this.model.change((mutator) => {
          mutator.insertNodes(insertRange, insertStructure);
          mutator.deleteNode(structureNode);
        });
        if (originalContainer.children.length === 0) {
          controller.executeCommand(
            'insert-html',
            '<span class="mark-highlight-manual">Voer inhoud in</span>',
            controller.rangeFactory.fromInNode(
              originalContainer,
              0,
              originalContainer.getMaxOffset()
            )
          );
        }
        controller.executeCommand(
          'recalculate-structure-numbers',
          controller,
          structureContainer,
          currentStructureType
        );
        controller.executeCommand(
          'recalculate-structure-numbers',
          controller,
          structureContent,
          currentStructureType
        );
        this.model.change(() => {
          const heading = insertStructure.children.find(
            (child) => child.getAttribute('property') === 'say:heading'
          );
          const range = controller.rangeFactory.fromInElement(heading, 0, 0);
          controller.selection.selectRange(range);
        });
      }
    }
  }
}
