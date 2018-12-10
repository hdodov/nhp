# nhp

## Syntax
1. Lines starting with `<` and ending with `>` are markup:
```
<ul>
```
```
<li>${i}</li>
```
2. To output multiline content, `<template>` tags are used where absolutely everything is considered markup:
```
<template>
  <p>This is markup.</p>
  Date.now() is <strong>too</strong>.
</template>
```
