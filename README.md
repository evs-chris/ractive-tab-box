# Ractive Tab Box

A Tab Box component built on [Ractive](https://github.com/ractivejs/ractive)

## Where to get it?

Racive Tab Box is available as a [giblet](https://github.com/evs-chris/gobble-giblet), a [component](https://github.com/componentjs/component), and a pre-assembled UMD module. Each flavor does not declare an explicit dependency on Ractive, but it is expected to be available as a global.

All of the pre-built files live in tags on the build branch.

### Development

Tab Box uses [gobble](https://github.com/gobblejs/gobble) as its build tool, which makes it easy to build and play around with. The default mode in the gobble file is `development`, which will automatically pull in the edge version of Ractive and make it available along with the sandbox. There is an example file provided along with the source, which you can access by running gobble and pointing you browser at http://localhost:4567/sandbox/example.html.

## Usage

Simply add a component reference to your template. Tabs may be specified as component content using `Tab` elements.

```html
<TabBox>
  <Tab title="Hello">Greetings!</Tab>
  <Tab title="Close Me" closable="true">I am closable.</Tab>
  <Tab>I shall be entitled 'Tab 2'</Tab>
</TabBox>
```

When the component is initialized, it grabs the contents of all of its `Tab` elements and sets them up internally. `Tab`s may optionally specify a title and whether or not they are closable. If a title is not provided, it defaults to `'Tab ' + index`. Tabs are not closable by default.

### Methods

#### `appendTab(options)`
Append a tab described by `options`.

`options` should be an object that may contain the following:
* `closable` - optional boolean - `true` if the tab is user closable. Defaults to `false`.
* `content` - optional string - A Ractive template to use as the content of the tab. Defaults to `'Tab ' + index`.
* `title` - optional string - A Ractive template to use as the title of the tab. Defaults to `'Tab ' + index`.

#### `changeTab(index)`
Activate the tab at `index`.

#### `closeTab(index)`
Close the tab at `index` and fire any close handler associated with it. If the associated handler returns a falsey value, the tab will not be closed.

The previous tab will be selected once the selected tab is closed.

#### `insertTab(index, options)`
Insert a tab, described by `options`, at `index`.

#### `resetTab(index, content)`
Change the content for the tab at `index`.

#### `resetTitle(index, title)`
Change the title for the tab at `index`.
