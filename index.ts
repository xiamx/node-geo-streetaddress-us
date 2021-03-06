import { spawnSync } from 'child_process'
import * as path from 'path'

/**
 * Object representing an address
 * 
 * Mirror of http://search.cpan.org/~timb/Geo-StreetAddress-US-1.04/US.pm#ADDRESS_SPECIFIER
 */
export interface AddressSpecifier {
    number: string;
    prefix: string;
    street: string;
    type: string;
    suffix: string;
    city: string;
    state: string;
    zip: string;
    sec_unit_type: string;
    sec_unit_num: string;
}

/**
 * Object representing an intersection
 * 
 * Mirror of http://search.cpan.org/~timb/Geo-StreetAddress-US-1.04/US.pm#INTERSECTION_SPECIFIER
 */
export interface IntersectionSpecifier {
    prefix1: string;
    prefix2: string;
    street1: string;
    street2: string;
    type1: string;
    type2: string;
    suffix1: string;
    suffix2: string;
    city: string;
    state: string;
    zip: string;
}

export type Specifier = AddressSpecifier | IntersectionSpecifier;

export type Command = 'parseLocation' | 'parseAddress' | 'parseInformalAddress';

/**
 * Spawn foreign perl code to parse address.
 */
function foreignSpawn(command: Command, address: string) {
    return spawnSync('perl', [
        path.join(__dirname, 'foreign/GeoStreetAddressRPC.pl'),
        command,
        address,
        ], {
        cwd: __dirname,
        encoding: 'buffer',
        timeout: 30 * 1000
    });
}

/**
 * Parse child process stdout to JSON
 */
function parseStdoutToJson(stdout: Buffer) {
    const stdoutString = stdout.toString('utf8').trim();
    if (stdoutString) {
        return JSON.parse(stdoutString);
    } else {
        throw new Error('Geo-StreetAddress-US was not able to parse the given address or location');
    }
}

/**
 * Parses any address or intersection string and returns the appropriate specifier. 
 * 
 * Mirror of http://search.cpan.org/~timb/Geo-StreetAddress-US-1.04/US.pm#parse_location
 */
export function parseLocation(address: string): Partial<Specifier> {
    if (!address) {
        throw new Error('Empty address provided');
    }
    let ret = foreignSpawn('parseLocation', address);
    if (ret.error) {
        const error = new Error('Failed to parse location');
        error.stack = ret.error.stack;
        throw error;
    } else {
        return parseStdoutToJson(ret.stdout);
    }
}

/**
 * Parses formal address string and returns the appropriate specifier. 
 * 
 * Mirror of http://search.cpan.org/~timb/Geo-StreetAddress-US-1.04/US.pm#parse_address
 */
export function parseAddress(address: string): Partial<AddressSpecifier> {
    if (!address) {
        throw new Error('Empty address provided');
    }
    let ret = foreignSpawn('parseAddress', address);
    if (ret.error) {
        const error = new Error('Failed to parse address');
        error.stack = ret.error.stack;
        throw error;
    } else {
        return parseStdoutToJson(ret.stdout);
    }
}

/**
 * Parses informal address string and returns the appropriate specifier. 
 * 
 * Mirror of http://search.cpan.org/~timb/Geo-StreetAddress-US-1.04/US.pm#parse_informal_address
 */
export function parseInformalAddress(address: string): Partial<AddressSpecifier> {
    if (!address) {
        throw new Error('Empty address provided');
    }
    let ret = foreignSpawn('parseInformalAddress', address);
    if (ret.error) {
        const error = new Error('Failed to parse informal address');
        error.stack = ret.error.stack;
        throw error;
    } else {
        return parseStdoutToJson(ret.stdout);
    }
}