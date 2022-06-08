# ember-rdfa-editor-besluit-plugin


Plugin that provides some helpers for interacting with besluit inside GN

*Note*: this plugin uses the new plugin architecture. It needs to be passed to the editor for inititialization.

```
    <Rdfa::RdfaEditor
      class="au-c-rdfa-editor"
      @profile={{@profile}}
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @editorOptions={{this.editorOptions}}
      @toolbarOptions={{this.toolbarOptions}}
      @plugins={{array 'besluit'}
    />


```


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install @lblod/ember-rdfa-editor-besluit-plugin
```


## Usage
The plugin card will trigger when the cursor is inside any html element with type `besluit:Besluit`

## Commands 

### Insert article command
This command allows the user to insert a new article

This command has 2 optional arguments:
 - content: Allows you to specify the content of the new article inserted
 - number: Allows you to specify the number of the new article inserted
If the number of the article is not specified the command will try to generate it based on the previous article numbers, if there are no more articles or they don't have a number a placeholder will be inserted

Example of complete command:
`this.args.controller.executeCommand('insert-article', this.args.controller, 'Content of the article', 1);`


## License
This project is licensed under the [MIT License](LICENSE.md).
