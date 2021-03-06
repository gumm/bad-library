/**
 * Created by gumm on 2017/01/27.
 */

const R = {
  'F': function() {},
  'T': function() {},
  '__': {'@@functional/placeholder': {}},
  'add': function() {},
  'addIndex': function() {},
  'adjust': function() {},
  'all': function() {},
  'allPass': function() {},
  'always': function() {},
  'and': function() {},
  'any': function() {},
  'anyPass': function() {},
  'ap': function() {},
  'aperture': function() {},
  'append': function() {},
  'apply': function() {},
  'applySpec': function() {},
  'ascend': function() {},
  'assoc': function() {},
  'assocPath': function() {},
  'binary': function() {},
  'bind': function() {},
  'both': function() {},
  'call': function() {},
  'chain': function() {},
  'clamp': function() {},
  'clone': function() {},
  'comparator': function() {},
  'complement': function() {},
  'compose': function() {},
  'composeK': function() {},
  'composeP': function() {},
  'concat': function() {},
  'cond': function() {},
  'construct': function() {},
  'constructN': function() {},
  'contains': function() {},
  'converge': function() {},
  'countBy': function() {},
  'curry': function() {},
  'curryN': function() {},
  'dec': function() {},
  'defaultTo': function() {},
  'descend': function() {},
  'difference': function() {},
  'differenceWith': function() {},
  'dissoc': function() {},
  'dissocPath': function() {},
  'divide': function() {},
  'drop': function() {},
  'dropLast': function() {},
  'dropLastWhile': function() {},
  'dropRepeats': function() {},
  'dropRepeatsWith': function() {},
  'dropWhile': function() {},
  'either': function() {},
  'empty': function() {},
  'eqBy': function() {},
  'eqProps': function() {},
  'equals': function() {},
  'evolve': function() {},
  'filter': function() {},
  'find': function() {},
  'findIndex': function() {},
  'findLast': function() {},
  'findLastIndex': function() {},
  'flatten': function() {},
  'flip': function() {},
  'forEach': function() {},
  'forEachObjIndexed': function() {},
  'fromPairs': function() {},
  'groupBy': function() {},
  'groupWith': function() {},
  'gt': function() {},
  'gte': function() {},
  'has': function() {},
  'hasIn': function() {},
  'head': function() {},
  'identical': function() {},
  'identity': function() {},
  'ifElse': function() {},
  'inc': function() {},
  'indexBy': function() {},
  'indexOf': function() {},
  'init': function() {},
  'insert': function() {},
  'insertAll': function() {},
  'intersection': function() {},
  'intersectionWith': function() {},
  'intersperse': function() {},
  'into': function() {},
  'invert': function() {},
  'invertObj': function() {},
  'invoker': function() {},
  'is': function() {},
  'isArrayLike': function() {},
  'isEmpty': function() {},
  'isNil': function() {},
  'join': function() {},
  'juxt': function() {},
  'keys': function() {},
  'keysIn': function() {},
  'last': function() {},
  'lastIndexOf': function() {},
  'length': function() {},
  'lens': function() {},
  'lensIndex': function() {},
  'lensPath': function() {},
  'lensProp': function() {},
  'lift': function() {},
  'liftN': function() {},
  'lt': function() {},
  'lte': function() {},
  'map': function() {},
  'mapAccum': function() {},
  'mapAccumRight': function() {},
  'mapObjIndexed': function() {},
  'match': function() {},
  'mathMod': function() {},
  'max': function() {},
  'maxBy': function() {},
  'mean': function() {},
  'median': function() {},
  'memoize': function() {},
  'merge': function() {},
  'mergeAll': function() {},
  'mergeWith': function() {},
  'mergeWithKey': function() {},
  'min': function() {},
  'minBy': function() {},
  'modulo': function() {},
  'multiply': function() {},
  'nAry': function() {},
  'negate': function() {},
  'none': function() {},
  'not': function() {},
  'nth': function() {},
  'nthArg': function() {},
  'objOf': function() {},
  'of': function() {},
  'omit': function() {},
  'once': function() {},
  'or': function() {},
  'over': function() {},
  'pair': function() {},

  'partial': function() {},
  'partialRight': function() {},
  'partition': function() {},
  'path': function() {},
  'pathEq': function() {},
  'pathOr': function() {},
  'pathSatisfies': function() {},
  'pick': function() {},
  'pickAll': function() {},
  'pickBy': function() {},
  'pipe': function() {},
  'pipeK': function() {},
  'pipeP': function() {},
  'pluck': function() {},
  'prepend': function() {},
  'product': function() {},
  'project': function() {},
  'prop': function() {},
  'propEq': function() {},
  'propIs': function() {},
  'propOr': function() {},
  'propSatisfies': function() {},
  'props': function() {},
  'range': function() {},
  'reduce': function() {},
  'reduceBy': function() {},
  'reduceRight': function() {},
  'reduceWhile': function() {},
  'reduced': function() {},
  'reject': function() {},
  'remove': function() {},
  'repeat': function() {},
  'replace': function() {},
  'reverse': function() {},
  'scan': function() {},
  'sequence': function() {},
  'set': function() {},
  'slice': function() {},
  'sort': function() {},
  'sortBy': function() {},
  'sortWith': function() {},
  'split': function() {},
  'splitAt': function() {},
  'splitEvery': function() {},
  'splitWhen': function() {},
  'subtract': function() {},
  'sum': function() {},
  'symmetricDifference': function() {},
  'symmetricDifferenceWith': function() {},
  'tail': function() {},
  'take': function() {},
  'takeLast': function() {},
  'takeLastWhile': function() {},
  'takeWhile': function() {},
  'tap': function() {},
  'test': function() {},
  'times': function() {},
  'toLower': function() {},
  'toPairs': function() {},
  'toPairsIn': function() {},
  'toString': function() {},
  'toUpper': function() {},
  'transduce': function() {},
  'transpose': function() {},
  'traverse': function() {},
  'trim': function() {},
  'tryCatch': function() {},
  'type': function() {},
  'unapply': function() {},
  'unary': function() {},
  'uncurryN': function() {},
  'unfold': function() {},
  'union': function() {},
  'unionWith': function() {},
  'uniq': function() {},
  'uniqBy': function() {},
  'uniqWith': function() {},
  'unless': function() {},
  'unnest': function() {},
  'until': function() {},
  'update': function() {},
  'useWith': function() {},
  'values': function() {},
  'valuesIn': function() {},
  'view': function() {},
  'when': function() {},
  'where': function() {},
  'whereEq': function() {},
  'without': function() {},
  'xprod': function() {},
  'zip': function() {},
  'zipObj': function() {},
  'zipWith': function() {}
};
