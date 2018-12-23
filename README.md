# nhp

## Syntax
1. `<template>` and `</template>` mark the start and end of markup, respectively. Options specified as attributes with no values (`<template option1 option2>` for example) can be applied to alter the behavior:

- `plain` the markup is parsed as a plain string, meaning that it will be compiled with quotes `"` instead of backticks `` ` ``
- `escape` HTML special characters are escaped
- `strip` removes starting and ending whitespace and whitespace between tags
- `return` denotes that the markup should not be added to the buffer, but instead returned for use in an expression

2. To avoid numerous repetitions of `<template>` tags, each new line starting with `<` marks the beginning of markup. The next line to have `>` will mark the end of markup. **Note:** The `>` symbol marks on which _line_ the markup ends, meaning that the whole line is added, regardless of where the symbol appears. For example:

```
1. foo
2. <p>bar</p>
3. baz
```
Line 2 is considered markup because it starts with `<` and it also contains `>`.

```
1. foo
2. <bar
3.   type="test"
4.   value="foo"
5. >hello</bar>
```
Here, markup begins on line 2 and ends on line 5 because that's where `>` appears. The full line is added, including `hello</bar>`, which is after the initial `>`.

```
1. <p>
2.   console.log('test');
3. </p>
```
Line 1 is markup because it contains both `<` and `>`, same thing with line 3. Line 2 is JavaScript because it contains none of that.

```
1. foo<p>bar</p>
```
This is not considered markup because the line doesn't begin with `<`.