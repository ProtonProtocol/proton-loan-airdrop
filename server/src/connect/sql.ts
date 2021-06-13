import mariadb from 'mariadb'
import { MARIADB_CONFIG_1, MARIADB_CONFIG_2 } from '../constants';

const pool = mariadb.createPool(MARIADB_CONFIG_1)
const pool2 = mariadb.createPool(MARIADB_CONFIG_2)
 
export const get_short_stakers = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM proton_ROWS WHERE contract='eosio' AND tbl='delxpr' AND field='quantity'"
    );

    const stakes = rows.map((row: any) => ({
      account: row.scope,
      amount: +row.fval.toString().split(' ')[0]
    }))

    return stakes
  } catch (err) {
	  throw err;
  } finally {
	  if (conn) {
      conn.end();
    }
  }
}

export const get_refunding_xpr = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM proton_ROWS WHERE contract='eosio' AND tbl='refundsxpr' AND field='quantity'"
    );

    const stakes = rows.map((row: any) => ({
      account: row.scope,
      amount: +row.fval.toString().split(' ')[0]
    }))

    return stakes
  } catch (err) {
	  throw err;
  } finally {
	  if (conn) {
      conn.end();
    }
  }
}

export const get_contracts = async () => {
  let conn;
  try {
    conn = await pool2.getConnection();
    const rows = await conn.query(
      "select * from proton_CONTRACTS;"
    );

    return rows
  } catch (err) {
	  throw err;
  } finally {
	  if (conn) {
      conn.end();
    }
  }
}