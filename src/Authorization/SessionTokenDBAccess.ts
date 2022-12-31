import { Pool } from 'pg';
import { SessionToken } from '../Server/Model';

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "nodedb",
  password: "123456",
  port: 5432,
}

export class SessionTokenDBAccess {

  private pool: Pool

  constructor() {
      this.pool = new Pool(credentials)
      this.pool.connect()
      this.pool.query(
        `CREATE TABLE IF NOT EXISTS tokens ( 
          id SERIAL PRIMARY KEY, 
          rights numeric[] NOT NULL, 
          expirationTime DATE NOT NULL, 
          username TEXT NOT NULL, 
          valid BOOLEAN NOT NULL , 
          tokenId TEXT NOT NULL
        )`
      )
  }

  public async storeSessionToken(token: SessionToken): Promise<void> {
    const { tokenId, username, valid, expirationTime, rights } = token
    return new Promise((resolve, reject) => {
      this.pool.query(
        'INSERT INTO tokens (tokenId, username, valid, expirationTime, rights) VALUES ($1, $2, $3, $4, $5)', 
        [tokenId, username, valid, expirationTime, rights], 
        (err: Error) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  public async getSessionToken(tokenId: string): Promise<SessionToken | undefined> {
    return new Promise((resolve, reject) => {
      this.pool.query(
        'SElECT * FROM tokens WHERE tokenId = $1', 
        [tokenId], 
        (err: Error, result) => {
          if (err) {
            reject(err)
          } else {
            if (!result.rows.length) {
              resolve(undefined) 
            } else {
              resolve(result.rows[0])
            }
          }
        }
      )
    })
  }
}
