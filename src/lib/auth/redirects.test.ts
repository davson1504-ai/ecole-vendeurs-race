import {describe,expect,it} from 'vitest';import {safeNextPath} from './redirects';
describe('safeNextPath',()=>{it('accepte un chemin interne',()=>expect(safeNextPath('/dashboard?tab=1')).toBe('/dashboard?tab=1'));it.each(['https://evil.test','//evil.test','javascript:alert(1)',''])('refuse une redirection externe ou vide: %s',(value)=>expect(safeNextPath(value)).toBe('/dashboard'));});
