# Config DOM

An experimental View library.


## API?

For passed configuration object:

### tag

    {
      tag: 'div'
    }

    becomes:
    <div></div>


### text

This sets the text content. Also works to insert raw HTML.

    {
      tag: 'span',
      text: 'hello world'
    }

    becomes:
    <span>hello world</span>

    // TODO: confirm this will override children and append if placed in config object after them.

### children

    {
      type: 'div'
      children: [
        {
          tag: 'span',
          text: 'hello world'
        }
      ]
    }

    becomes:
    <div>
      <span>hello world</span>
    </div>


### append

Appends pre-created elements. If you have:

    var e = document.createElement('span');
    e.innerHTML = 'hello world';

Then:

    {
      type: 'div'
      append: [
        e
      ]
    }

    becomes
    <div>
      <span>hello world</span>
    </div>

This may be integrated into children, with a object vs. elem check.
