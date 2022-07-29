'use strict'

var semver = require('semver')
var sqlSummary = require('sql-summary')

var shimmer = require('../shimmer')
var symbols = require('../../symbols')
var { getDBDestination } = require('../context')

module.exports = function (mariadb, agent, { version, enabled }) {
    var ins = agent._instrumentation
    // console.log(mariadb);
    shimmer.wrap(mariadb, 'createConnection', (original) => {
        return (opts) => {
            return original(opts).then(result => {
                // console.log(result);
                result.query = shimmer.wrap(result, 'query', wrapQuery)
                // console.log(result);
                return result
            });
        }
    })

    return mariadb

    function wrapQuery(original) {
        console.log("HOLAAAAAAA");
        return async function wrappedQuery(sql, values) {
            console.log("Ejecutando query");
            var span = enabled && agent.startSpan(null, 'db', 'mariadb', 'query')
            var id = span && span.transaction.id
            var hasCallback = false
            var sqlStr = sql

            if (span && sqlStr) {
                agent.logger.debug('extracted sql from mariadb query %o', { id: id, sql: sqlStr })
                span.setDbContext({ statement: sqlStr, type: 'sql' })
                span.name = sqlSummary(sqlStr)
            }

            var result = await original.apply(this, arguments)
            span.end()

            return result
        }
    }
}
