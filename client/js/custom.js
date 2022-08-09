window.onload = function () {
    ace.config.set(
        'basePath',
        'https://cdnjs.cloudflare.com/ajax/libs/ace/1.8.0/'
    )
    const aceEditorElement = document.getElementById('editor')
    const aceEditor = window.ace.edit(aceEditorElement)
    aceEditor.setOptions({
        enableBasicAutocompletion: true, // the editor completes the statement when you hit Ctrl + Space
        enableLiveAutocompletion: true, // the editor completes the statement while you are typing
        showPrintMargin: false, // hides the vertical limiting strip
        wrap: 1,
        fontSize: '100%', // ensures that the editor fits in the environment
    })
    // aceEditor.

    // defines the style of the editor
    aceEditor.setTheme('ace/theme/monokai')
    aceEditor.getSession().setMode('ace/mode/json') // hides line numbers (widens the area occupied by error and warning messages)

    retrieveConfig()

    aceEditor.resize()

    setInterval(async () => {
        retrieveActivity()
    }, 2000)
}

const retrieveConfig = async () => {
    try {
        const customConfig = await window.electronAPI.getConfig()
        drawConfig(customConfig)
        // drawActivity(activity)
    } catch (exception) {
        drawConfig(null)
    }
}

const retrieveActivity = async () => {
    try {
        activity = await window.electronAPI.getActivity()
        drawActivity(activity)
    } catch (exception) {}
}

const drawActivity = (activity) => {
    const activityLogger = document.getElementById('activity-logger')
    str = ''
    for (const log of activity) {
        str += `-> ${log} \n`
    }
    activityLogger.value = str
}

const startStopBot = () => {
    const aceEditorElement = document.getElementById('editor')
    var aceEditor = window.ace.edit(aceEditorElement)
    config = aceEditor.getValue()
    window.electronAPI.startStopBot(config)
}

const drawConfig = (customConfig) => {
    const defaultConfig = `{
        \"rules\": [
            {
                \"name\": \"rule_ape_society\",
                \"policy_id\": \"dac355946b4317530d9ec0cb142c63a4b624610786c2a32137d78e25\",
                \"under_value\": 450
            },
            {
                \"name\": \"cornucopia_land\",
                \"policy_id\": \"07b39a8ead0ef1e3054e816a3b6910060beaf2210fded63fb90ce137\",
                \"under_value\": 10,
                \"traits_filter\": {}
            }
        ],
        \"settings\": {
            \"main_wallet\": {
              \"seed_key\": [
                  \"word_1\",
                  \"word_2\"
                 ]
            }
        }
       }`
    const beautify = ace.require('ace/ext/beautify')
    const aceEditorElement = document.getElementById('editor')
    const aceEditor = window.ace.edit(aceEditorElement)
    const aceEditorSession = aceEditor.getSession()
    if (!customConfig) {
        aceEditorSession.setValue(defaultConfig)
    } else {
        aceEditorSession.setValue(JSON.stringify(customConfig))
    }
    beautify.beautify(aceEditorSession)
}
