const render = function (state) {

    const filterIgnoreReservedWords = function([key, value]){
        return !['computed', 'events', 'handlers'].includes(key)
    }

    const mapReturnOnlyPropertyKeys = function(arrayProperty){
        return arrayProperty[0]
    }

    const data = Object.entries(state)
    .filter(filterIgnoreReservedWords)
    .map(mapReturnOnlyPropertyKeys)

    const renderInputs = function (property) {
        const elementValue = document.querySelector(`[rd-value=${property}]`)
        if (elementValue) {
            elementValue.value = state[property]
        }
    }

    const renderText = function(property) {
        const element = document.querySelector(`[rd-text=${property}]`)
        if (element) {
            element.innerHTML = state[property]
        }
    }

    data.forEach(property => {
        renderInputs(property)
        renderText(property)
    });
}

const setupComputed = function (obj) {
    if (!obj.computed) {
        return
    }

    Object.entries(obj.computed).forEach(function (computed) {
        const name = computed[0]
        const fn = computed[1]
        obj[name] = fn.call(obj)
    })

    return obj
}

const setupHandlers = function (state) {
    Object.entries(state.handlers).forEach(function (handler) {
        state.handlers[handler[0]] = handler[1].bind(state)
    })
}

const setupEvents = function (state) {
    const setupEvent = function (event) {
        const target = document.querySelector(event[1][1])
        target.addEventListener(event[1][0], state.handlers[event[1][2]])
    }
    Object.entries(state.events).forEach(function (event) {
        setupEvent(event)
    })
}

const Redom = function (model) {

    var state = new Proxy(model, {
        set: function (obj, prop, value) {
            obj[prop] = value
            setupComputed(obj)
            render(obj)
        }
    });

    setupComputed(state)
    setupHandlers(state)
    setupEvents(state)
    render(state)
};

window.onload = function(){

    const model = {
        value: 2,
        name: "Rondy",
        computed: {
            doubleValue () {
                return this.value * 2
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
                '*[rd-value=name]',
                'onInputNameChange'
            ]
        },
        handlers: {
            increment: function () {
                this.value += 1
            },
            decrement: function () {
                this.value -= 1
            },
            onInputNameChange: function (event) {
                this.name = event.target.value
            }
        }
    }
    const redom = new Redom(model)
    console.log(redom)
}
