const { execFileSync, spawn } = require('child_process')
const { platform } = process
const { join, resolve } = require('path')
const { log } = console
const getCmd = resolve(__dirname, 'get-cmd.sh')
const windowsScript = join(__dirname, 'msgbox.vbs')

const makeAlert = (input = '', thingToUse) => {
  if (thingToUse) {
    if (thingToUse === 'window') {
      return (str) => window.alert(str)
    }
    if (thingToUse === 'console') {
      return (str) => log(str)
    } else {
      const theAlert = (cmds) => spawn(cmds[0], cmds.splice(1))
      let theCmds = (str) => [ str ]
      switch (thingToUse) {
        case 'zenity':
          theCmds = (str) => [ 'zenity', '--info', '--text', str ]
          break
        case 'yad':
          theCmds = (str) => [ 'yad', '--text', str, '--button', 'OK' ]
          break
        case 'notify-send':
          theCmds = (str) => [ 'notify-send', str ]
          break
        case 'xmessage':
          theCmds = (str) => [ 'xmessage', str ]
          break
        case 'osascript':
          theCmds = (str) => [ 'osascript', '-e', `tell app "System Events" to display dialog "${str}" buttons "OK"` ]
          break
        case 'cscript':
          theCmds = (str) => [ 'cscript',  windowsScript, str ]
          break
        default:
          return (str) => log(str)
      }
      return (str) => theAlert(theCmds(str))
    }
  }

  if (process.browser && window && window.alert && typeof window.alert === 'function') {
    return (str) => window.alert(str)
  } else {
    const theAlert = (cmds) => spawn(cmds[0], cmds.splice(1))
    let theCmds = (str) => [ str ]

    switch (platform) {
      case 'linux':
      case 'freebsd':
      case 'sunos':
        const properCmd = execFileSync(getCmd).toString().trim()
        switch (properCmd) {
          case 'zenity':
            theCmds = (str) => [ 'zenity', '--info', '--text', str ]
            break
          case 'yad':
            theCmds = (str) => [ 'yad', '--text', str, '--button', 'OK' ]
            break
          case 'notify-send':
            theCmds = (str) => [ 'notify-send', str ]
            break
          case 'xmessage':
            theCmds = (str) => [ 'xmessage', str ]
            break
          default:
            return (str) => log(str)
        }
        return (str) => theAlert(theCmds(str))
      case 'darwin':
        theCmds = (str) => [ 'osascript', '-e', `tell app "System Events" to display dialog "${str}" buttons "OK"` ]
        return (str) => theAlert(theCmds(str))
      case 'win32':
        theCmds = (str) => [ 'cscript',  windowsScript, str ]
        // TODO:
        // theCmds = (str) => [ 'msg', '"%username%"', str ]
        return (str) => theAlert(theCmds(str))
      default: // TODO:
        return (str) => log(str)
    }
  }
}

module.exports = makeAlert()
