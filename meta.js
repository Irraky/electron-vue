'use strict'

const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const { get } = require('https')

function getCurrentSHA (author) {
  return new Promise((resolve, reject) => {
    let isBranch = process.argv[2].indexOf('#') > -1

    get({
      host: 'api.github.com',
      path: `/repos/simulatedgreg/electron-vue/commits${isBranch ? '?sha=' + process.argv[2].split('#')[1] : ''}`,
      headers: {
        'User-Agent': author
      }
    }, res => {
      res.setEncoding('utf8')
      let rawData = ''

      res.on('data', chunk => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          let parsed = JSON.parse(rawData)
          resolve(parsed[0].sha)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', e => {
      reject(e)
    })
  })
}

function appendSHALink (sha, destDirName) {
  let readmePath = join(destDirName, '/README.md')
  let md = readFileSync(readmePath, 'utf8')
  md = md.replace(
    ' using',
    `@[${sha.substring(0, 7)}](https://github.com/SimulatedGREG/electron-vue/tree/${sha}) using`
  )
  writeFileSync(readmePath, md, 'utf8')
}

module.exports = {
  prompts: {
    name: {
      type: 'string',
      required: true,
      message: 'Application Name'
    },
    description: {
      type: 'string',
      required: false,
      message: 'Project description',
      default: 'An electron-vue project'
    },
    plugins: {
      type: 'checkbox',
      message: 'Select which Vue plugins to install',
      choices: ['axios', 'vue-electron', 'vue-router', 'vuex', 'vue-spacebro-client'],
      default: ['axios', 'vue-electron', 'vue-router', 'vuex', 'vue-spacebro-client']
    },
    eslint: {
      type: 'confirm',
      require: true,
      message: 'Use linting with ESLint?',
      default: true
    },
    eslintConfig: {
      when: 'eslint',
      type: 'list',
      message: 'Which eslint config would you like to use?',
      choices: [
        {
          name: 'Standard (https://github.com/feross/standard)',
          value: 'standard',
          short: 'Standard'
        },
        {
          name: 'AirBNB (https://github.com/airbnb/javascript)',
          value: 'airbnb',
          short: 'AirBNB'
        },
        {
          name: 'none (configure it yourself)',
          value: 'none',
          short: 'none'
        }
      ]
    },
    unit: {
      type: 'confirm',
      message: 'Setup unit testing with Karma + Mocha?',
      required: true
    },
    e2e: {
      type: 'confirm',
      message: 'Setup end-to-end testing with Spectron + Mocha?',
      require: true
    },
    builder: {
      type: 'list',
      message: 'What build tool would you like to use?',
      choices: [
        {
          name: 'electron-packager (https://github.com/electron-userland/electron-packager)',
          value: 'packager',
          short: 'packager'
        },
        {
          name: 'electron-builder (https://github.com/electron-userland/electron-builder)',
          value: 'builder',
          short: 'builder'
        }
      ]
    },
    settings: {
      type: 'confirm',
      message: 'Setup settings with standard-settings?',
      require: true
    }
  },
  helpers: {
    isEnabled (list, check, opts) {
      if (list[check]) return opts.fn(this)
      else return opts.inverse(this)
    },
    deps (plugins) {
      let output = ''
      let dependencies = {
        'axios': '^0.16.1',
        'vue-electron': '^1.0.6',
        'vue-router': '^2.5.3',
        'vuex': '^2.3.1',
        'vue-spacebro-client': '^1.0.0'
      }

      if (Object.keys(plugins).length > 0) output += ',\n'

      Object.keys(plugins).forEach((p, i) => {
        output += `    "${p}": "${dependencies[p]}"`
        if (i !== Object.keys(plugins).length - 1) output += ',\n'
      })

      return output
    },
    testing (unit, e2e, opts) {
      if (unit || e2e) {
        return opts.fn(this)
      }
    }
  },
  filters: {
    'src/renderer/routes.js': 'plugins[\'vue-router\']',
    'src/renderer/components/LandingPageView/CurrentPage.vue': 'plugins[\'vue-router\']',
    'src/renderer/router/**/*': 'plugins[\'vue-router\']',
    'src/renderer/store/**/*': 'plugins[\'vuex\']',
    'src/renderer/store/modules/Media.js': 'plugins[\'vuex\'] && plugins[\'vue-spacebro-client\']',
    'test/e2e/**/*': 'e2e',
    'test/unit/**/*': 'unit',
    '.electron-vue/build.config.js': 'builder === \'packager\'',
    'test/.eslintrc': 'e2e || unit',
    '.eslintignore': 'eslint',
    '.eslintrc.js': 'eslint',
    'appveyor.yml': 'builder === \'builder\'',
    '.travis.yml': 'builder === \'builder\'',
    'settings/**': 'settings',
    'src/renderer/lib/settings.js': 'settings',
    'test/unit/specs/settings.spec.js': 'unit && settings',
    'test/e2e/specs/settings.spec.js': 'e2e && settings'
  },
  complete (data) {
    getCurrentSHA(data.author).then(sha => {
      let path = !data.inPlace ? data.destDirName : null
      if (path !== null) appendSHALink(sha, path)
      console.log([
        '\n---',
        '',
        'All set. Welcome to your new electron-vue project!',
        '',
        'Make sure to check out the documentation for this boilerplate at',
        '\x1b[33mhttps://simulatedgreg.gitbooks.io/electron-vue/content/\x1b[0m.',
        '',
        `Next Steps:\n${!data.inPlace ? '\n  \x1b[33m$\x1b[0m cd ' + data.destDirName : ''}`,
        '  \x1b[33m$\x1b[0m yarn (or `npm install`)',
        '  \x1b[33m$\x1b[0m yarn run dev (or `npm run dev`)'
      ].join('\n'))
    }, () => {
      console.log('\x1b[33mwarning\x1b[0m Failed to append commit SHA on README.md')
    })
  }
}
