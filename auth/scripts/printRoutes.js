const app = require('../src/app')

function listRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase()
      console.log(`${methods} ${prefix}${layer.route.path}`)
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newPrefix = layer.regexp && layer.regexp.source !== '^\\/?$' ? (layer.regexp.source.replace('^\\/?', '').replace('\\/?$', '') || '') : ''
      // fallback: inspect keys
      listRoutes(layer.handle.stack, prefix + (layer.regexp && layer.regexp.source !== '^\\/?$' ? (layer.regexp.source.includes('^\\/?') ? '' : prefix) : ''))
      // can't always extract prefix from regexp cleanly; print raw layer
    }
  })
}

// Try to print readable routes from app
if (app && app._router && app._router.stack) {
  console.log('Top-level routes:')
  app._router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase()
      console.log(`${methods} ${layer.route.path}`)
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // print children
      layer.handle.stack.forEach(l => {
        if (l.route) {
          const methods = Object.keys(l.route.methods).join(',').toUpperCase()
          console.log(`${methods} ${layer.regexp} -> ${l.route.path}`)
        }
      })
    }
  })
} else {
  console.log('No routes found')
}
