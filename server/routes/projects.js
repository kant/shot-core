const multiparty = require('multiparty')

const { get, all } = require('../db')
const importer = require('../services/importer')
const projectDestroyer = require('../services/project-destroyer')

const Shot = require('../decorators/shot')

exports.new = (req, res) => {
  res.render('project/new')
}

exports.create = (req, res, next) => {
  new multiparty.Form().parse(req, function (err, fields, files) {
    if (err) return next(err)

    let [name] = fields.name // project name
    let [file] = files.file // first attached file

    if (!name) return next(new Error('Missing name'))

    if (!file || file.size == 0) {
      return next(new Error('Missing or invalid ZIP file'))
    }

    try {
      let { uri: redirectUri } = importer({ pathToZip: file.path })
      return res.redirect(redirectUri)
    } catch (err) {
      return next(err)
    }
  })
}

exports.show = (req, res) => {
  let { projectId } = req.params

  let project = get('SELECT * FROM projects WHERE id = ?', projectId)

  let { days_count } = get('SELECT COUNT(id) as days_count FROM events WHERE event_type = ? AND project_id = ?', "day", projectId)
  let { scenes_count } = get('SELECT COUNT(id) as scenes_count FROM scenes WHERE project_id = ?', projectId)
  let { shots_count } = get('SELECT COUNT(id) as shots_count FROM shots WHERE project_id = ?', projectId)

  res.render('project', {
    project,
    days_count,
    scenes_count,
    shots_count
  })
}

exports.destroy = (req, res) => {
  let { projectId } = req.params

  try {
    projectDestroyer({ projectId })
    return res.redirect('/')
  } catch (err) {
    return next(err)
  }
}
