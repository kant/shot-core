const { run, get, all } = require('../db')

let ALLOWED = [
  'zcam_wired_ip',
  'zcam_wireless_ip',
  'uploads_path',
  'active_project_id'
]

const getSettings = () =>
  get(
    `SELECT ${ALLOWED.join(',')}
     FROM settings
     LIMIT 1`)

const getProjects = () =>
  all(
    `SELECT * FROM projects`)

exports.index = (req, res) => {
  const settings = getSettings()
  const projects = getProjects()

  res.render('settings', {
    ...settings,
    projects,
    default_uploads_path: require('../config').UPLOADS_PATH
  })
}

exports.update = (req, res) => {
  let before = getSettings()

  let changed = {}
  for (let key of ALLOWED) {
    if (req.body[key] != null) {
      let value = req.body[key] == '' ? null : req.body[key]
      if (value != before[key]) {
        changed[key] = [value, before[key]]
      }
    }
  }

  for (let [key, [value, prev]] of Object.entries(changed)) {
    run(`UPDATE settings SET ${key} = ?`, value)
  }

  let changelog = Object.entries(changed).map(([key, [value, prev]]) => `${key} changed from ${prev} to ${value}`)
  changelog = changelog.join('<br />\n')

  const after = getSettings()
  const projects = getProjects()

  res.render('settings', {
    flash: `Saved.<br /><small class="f6 o-60">` + changelog + '</small>',
    ...after,
    projects,
    default_uploads_path: require('../config').UPLOADS_PATH
  })
}
