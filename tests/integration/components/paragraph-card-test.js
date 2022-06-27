import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | paragraph-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ParagraphCard />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <ParagraphCard>
        template block text
      </ParagraphCard>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
