const render = function (state) {
    // console.log('>>>', new Date(), );
    // const value = document.getElementById('value')
    // const doubleValue = document.getElementById('doubleValue')

    // value.innerHTML = state.value
    // doubleValue.innerHTML = state.doubleValue

    const data = Object.entries(state)
    .filter(function([key, value]){
        return !['computed', 'events', 'handlers'].includes(key)
    })
    .map(function(arrayProperty){
        return arrayProperty[0]
    })

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
        console.log('>>prop', property, state[property]);
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
        // console.log('e', event[1], state.handlers[event[1][2]])
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
            ]
        },
        handlers: {
            increment: function () {
                this.value += 1
            },
            decrement: function () {
                this.value -= 1
            }
        }
    }
    const redom = new Redom(model)
    console.log(redom)
}
