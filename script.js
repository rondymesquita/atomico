"use strict"
const log = console.log

const validate = function (model, instance) {
    if (!model.computed) {
        return
    }

    if (!instance) {
      throw new Error("No instance informed")
    }
}

const setupComputed = function (model, instance) {
  validate(model, instance)

  Object.entries(model.computed).forEach(function ([name, fn]) {
      instance[name] = fn.call(instance)
  })
  log('Computed mounted')
}

const setupHandlers = function (model, instance) {
  validate(model, instance)
  Object.entries(model.handlers).forEach(function (handler) {
      // console.log('h', handler)
      const name = handler[0]
      const fn = handler[1]
      instance.handlers[name] = fn.bind(instance)
  })
  log('Handlers mounted')
}

const setupEvents = function (model, instance) {
  validate(model, instance)
  const setupEvent = function (event) {
      const eventName = event[1][0]
      const selector = event[1][1]
      const handlerName = event[1][2]
      const target = document.querySelector(selector)
      // console.log('e', event[1], model.handlers[event[1][2]])
      target.addEventListener(eventName, instance.handlers[handlerName])
  }
  Object.entries(model.events).forEach(function (event) {
      setupEvent(event)
  })
  log('Events mounted')
}

const setupDom = function(model, instance) {
  validate(model, instance)

  Object.entries(model.selectors).forEach(function ([name, selector]) {
    // console.log(name, selector)
    instance.dom[name] = document.querySelector(selector)
  })
  log('Dom mounted')
    // console.log('setupdom', instance)
}

const Redom = function (model) {

  const ignoredProps = ['handlers', "dom"]
  const instance = new Proxy(model.data, {
      set: function (_instance, prop, value) {
          _instance[prop] = value

          const run = !ignoredProps.includes(prop) && _instance.dom && Object.keys(_instance.dom).length != 0 && _instance.render
          if(run) {
            setupComputed(model, _instance)
            _instance.render()
          }

          return true
      }
  });

  
  instance.render = model.render.bind(instance)
  instance.mounted = model.mounted.bind(instance)
  instance.handlers = {}
  instance.dom = {}
  instance.mount = {}

  setupComputed(model, instance)
  setupHandlers(model, instance)
  setupEvents(model, instance)
  setupDom(model, instance)

  instance.mounted()
  instance.render()
};

let updateCount = 0

window.onload = function(){
    
    const model = {
        root: "#app", 
        data: {
            counter: 3,
            name: "Rondy",
            surname: "Mesquita",
            title: "New Title",
            color: "red"
        },
        selectors: {
          title: "#title",
          counter: "#counter",
          doubleCounter: "#doubleCounter",
          name: "#name-output",
          nameInput: "#name-input",
          surnameInput: "#surname-input",
          surname: "#surname-output",
          sendButton: "#sendButton",
          fullnameOutput: "#fullname-output"
        },
        computed: {
            doubleCounter () {
                return this.counter * 2
            },
            fullname(){
              return `${this.name} ${this.surname}`
            }
        },
        events: {
            increment: [
                'click',
                '#increment',
                'increment'
            ],
            decrement: [
                'click',
                '#decrement',
                'decrement'
            ],
            onInputName: [
              'input',
              '#name-input',
              'onInputName'
            ],
            onInputSurname: [
              'input',
              '#surname-input',
              'onInputSurnameInput'
            ],
            changeButtonColor: [
              "click",
              "#changeButtonColor",
              'onChangeButtonColor'
            ]
        },
        handlers: {
            increment: function () {
                this.counter += 1
            },
            decrement: function () {
                this.counter -= 1
            },
            onInputName: function(event){
              this.name = event.target.value
            },
            onInputSurnameInput: function(event){
              this.surname = event.target.value
            },
            onChangeButtonColor: function(){
              this.color = this.color === "red" ? "blue" : "red"
            },
            updateName: function(){
              this.dom.name.innerHTML = this.name
              this.dom.nameInput.value = this.name
            }
        },
        mounted: function() {
          // setInterval(() => {
            this.dom.title.innerHTML = new Date().getTime()
          // }, 1000)
        },
        render: function(){
          this.dom.title.innerHTML = this.title + " : " + this.counter
          this.dom.counter.innerHTML = this.counter
          this.dom.doubleCounter.innerHTML = this.doubleCounter

          this.handlers.updateName()

          this.dom.surname.innerHTML = this.surname
          this.dom.surnameInput.value = this.surname

          this.dom.fullnameOutput.innerHTML = this.fullname

          this.dom.sendButton.style.background = this.color

        }
    }
    const redom = new Redom(model)
}


new MutationObserver((ms) => {
  // console.log(">>>mutations", ms.length)
}).observe(document.body, {childList: true, subtree: true, attributes: true, characterData: true})