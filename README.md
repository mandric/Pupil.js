# Pupil
An easy and powerful string-based validation library.

## Features
* Supports IE7+
* Nested validation rules
* String-based validation rules for compatibility between different languages
* Light re-evaluation via caching

## Installation
Download `dist/Pupil.min.js` and include it on your page.

## Usage
The basic syntax is this:

```javascript
Pupil.validate(rules, values);
```

Where `rules` and `values` are objects with matching keys. The rules are specified as `rule strings`; more information on those below.

For example:

```javascript
var rules = {
	name: 'min:3 && max:8',
	country: 'min:2'
};

var values = {
	name: nameInputElem.value,
	country: countryInputElem.value
};
```

The two objects don't have to have identical keys, but values without a matching key in rules won't be evaluated at all.

The `validate()` method returns an object like this:

```javascript
{
	name: true,    // Name passed validation
	country: false // Country didn't
}
```

## Rule strings
Rule strings are Pupil's primary method of specifying validation rules.

Logical operators (`&& (and)`, `|| (or)`, `! (not)`) and "blocks" (`(`, `)`) have an identical syntax to most
programming languages, but functions are used like this: `name:arg1,arg2` where `name` is
the name of the function and `arg1` and `arg2` are the arguments for it.

For each validation function, there is also a matching function prepended by `other` that allows you to run functions
on other values than the one the rule string is for. This can be useful for fields that have differing requirements depending on another field. For example:

```javascript
{
	state: 'minLen:2 || ( ! otherEquals:country,US && minLen:0)'
}
```

The rule strings can also be nested indefinitely by using blocks.  
The following example would require a state name of at least 2 characters for those who have chosen US or CA as their country.

```javascript
{
	state: 'minLen:2 || (( ! otherEquals:country,US && ! otherEquals:country,CA) && minLen:0)'
}
```