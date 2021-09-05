// const log = require('./log')

const SDB = require('social-db');

const sdb = new SDB({
    config: {
        neo4j: {
            hostname: 'localhost',
            port: 7687,
            username: 'neo4j',
            password: 'test', // default password is "neo4j"
        },
        redis: {
        host: 'localhost',
        port:  6379,
        password: '',
        },
        nodes: {
        EVENT: 'Topic',
        GROUP: 'Group',
        USER: 'User',
        GHOST: 'Contact'
        }
    },
});

const createUserQuery = `
    CREATE (u:User {name: 'bill'})
    RETURN u
`

const myQuery = `
    CALL apoc.util.sleep(61000)
    MATCH (node)
    RETURN node
`

const runCommand = () => {
    return sdb.exec(myQuery, {})
}

export const runConsecutiveCommands = async() => {
    await sdb.exec(createUserQuery, {})

    const fns = []
    for (let i = 0; i < 200; i++) {
        const f = runCommand().then((data ) => {
            console.log('completed iter' + i)
            return data
        }).catch((err) => {
            console.error('error completeing' + i)
            console.error(err)
            return 'error'
        })
        fns.push(f)
    }
    return await Promise.all(fns)

}
