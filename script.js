const log = console.log

const setupComputed = function (model, data) {
    if (!model.computed) {
        return
    }

    Object.entries(model.computed).forEach(function ([name, fn]) {
        data[name] = fn.call(data)
    })
}

const setupHandlers = function (model, data) {
    Object.entries(model.handlers).forEach(function (handler) {
        // console.log('h', handler)
        model.handlers[handler[0]] = handler[1].bind(data)
    })
}

const setupEvents = function (model, data) {
    const setupEvent = function (event) {
        const target = document.querySelector(event[1][1])
        // console.log('e', event[1], model.handlers[event[1][2]])
        target.addEventListener(event[1][0], model.handlers[event[1][2]])
    }
    Object.entries(model.events).forEach(function (event) {
        setupEvent(event)
    })
}

const setupDom = function(model) {
    // console.log('setupdom', model.dom)
    Object.entries(model.dom).forEach(function ([name, selector]) {
      console.log(name, selector)
        model.dom[name] = document.querySelector(selector)
    })
}

const Redom = function (model) {
  

    var data = new Proxy(model.data, {
        set: function (_data, prop, value) {
            // console.log('set', prop, value, _data)
            _data[prop] = value
            setupComputed(model, _data)
            model.update()
            return true
        }
    });

  // log('2')
    setupComputed(model, data)
    setupHandlers(model, data)
    setupEvents(model, data)
    setupDom(model)

    model.update = model.update.bind(model)
    model.update()
};

let updateCount = 0

window.onload = function(){
    
    const model = {
        data: {
            counter: 3,
            name: "Rondy",
            title: "New Title",
            color: "red"
        },
        dom: {
          title: "#title",
          counter: "#counter",
          doubleCounter: "#doubleCounter",
          name: "#name-output",
          nameInput: "#name-input",
          surnameInput: "#surname-input",
          sendButton: "#sendButton",
        },
        computed: {
            doubleCounter () {
                return this.counter * 2
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
            onChangeButtonColor: function(){
              this.color = this.color === "red" ? "blue" : "red"
            }
        },
        update: function(){
          console.log('update count', updateCount++)
          
          this.dom.title.innerHTML = this.data.title + " : " + this.data.counter
          this.dom.counter.innerHTML = this.data.counter
          this.dom.doubleCounter.innerHTML = this.data.doubleCounter
          this.dom.name.innerHTML = this.data.name
          this.dom.nameInput.value = this.data.name

          this.dom.surnameInput.value = this.data.name
          // log(typeof this.dom.sendButton, Object.keys(this.dom.sendButton))
          // document.querySelector("#sendButton").style.background = this.data.color
          // this.dom.sendButton.style.border = "1px solid red"
          // this.dom.sendButton.style.background = this.data.color

        }
    }
    const redom = new Redom(model)
    // console.log(redom)
}


new MutationObserver((ms) => {
  console.log(">>>mutations", ms.length)
}).observe(document.body, {childList: true, subtree: true, attributes: true, characterData: true})