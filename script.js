const render = function (state) {
   
    const value = document.getElementById('value')
    const doubleValue = document.getElementById('doubleValue')

    // const value = document.querySelector('*[rd-name]')

    value.innerHTML = state.value
    doubleValue.innerHTML = state.doubleValue
}

const setupComputed = function (obj) {
    // console.log('setupCompute', obj.computed)
    if (!obj.computed) {
        return
    }

    Object.entries(obj.computed).forEach(function (computed) {
        // console.log('>>>', computed)
        const name = computed[0]
        const fn = computed[1]
        obj[name] = fn.call(obj)
        // console.log('>>>', name, computed[1]())
    })

    // console.log('obj', obj)
    return obj
}

const setupHandlers = function (state) {
    Object.entries(state.handlers).forEach(function (handler) {
        // console.log('h', handler)
        state.handlers[handler[0]] = handler[1].bind(state)
    })
}

const setupEvents = function (state) {
    const setupEvent = function (event) {
        const target = document.querySelector(event[1][1])
        console.log('e', event[1], state.handlers[event[1][2]])
        target.addEventListener(event[1][0], state.handlers[event[1][2]])
    }
    Object.entries(state.events).forEach(function (event) {
        setupEvent(event)
    })
}

const Redom = function (model) {

    var state = new Proxy(model, {
        set: function (obj, prop, value) {
            console.log('set', prop, value)
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