<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            electron-vue comes packed with detailed documentation that covers everything from
            internal configurations, using the project structure, building your application,
            and so much more.
          </p>
          <button @click="open('https://simulatedgreg.gitbooks.io/electron-vue/content/')">Read the Docs</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Other Documentation</div>
          <button class="alt" @click="open('https://electron.atom.io/docs/')">Electron</button>
          <button class="alt" @click="open('https://vuejs.org/v2/guide/')">Vue.js</button>
        </div>
      {{#isEnabled plugins 'vue-spacebro-client'}}
        <div class="spacebro">
          <div class="title alt">Spacebro</div>
          <button @click="sendMessage()">Send message</button>
          {{#isEnabled plugins 'vuex'}}
          <button @click="sendMedia()">Send media</button>
          {{/isEnabled}}
        </div>
      {{/isEnabled}}
        <div class="static">
          <div class="title alt">Static assets</div>
          <img id="static" src="static/static.png" alt="static asset">
          <div>
            Static assets can be accessed in <div class="value">static/</div>.<br/>
          If you just need it in the rendered side, use <div class="value">src/renderer/assets</div>.
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      {{#isEnabled plugins 'vue-spacebro-client'}}
      sendMessage () {
        this.$spacebro.emit(this.$spacebro.config.client.out.outMessage.eventName, {
          message: 'thank you'.split('').sort(function () { return 0.5 - Math.random() }).join('')
        })
      },
      sendMedia () {
        this.$spacebro.emit(this.$spacebro.config.client.out.outMedia.eventName, {
          url: 'http://lorempixel.com/400/200/business/spacebro-is-' + 'awesome'.split('').sort(function () { return 0.5 - Math.random() }).join(''),
          file: 'file.jpg',
          type: 'image/jpg',
          details: {
            width: 320,
            height: 240
          },
          meta: {
            title: 'galaxy',
            description: 'galaxy image'
          }
        })
      },
      {{/isEnabled}}
      open (link) {
        {{#isEnabled plugins 'vue-electron'}}this.$electron{{else}}require('electron'){{/isEnabled}}.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  p {
    color: black;
    margin-bottom: 10px;
  }

  button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }

  .value {
    display: inline;
    color: #35495e;
    font-weight: bold;
  }
</style>
