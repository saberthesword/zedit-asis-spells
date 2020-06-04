registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE, xelib.gmTES5],
    settings: {
        label: 'NPC Gets Spells',
        templateUrl: `${patcherUrl}/partials/settings.html`,
        defaultSettings: {}
    },
    
    requiredFiles: [],
    getFilesToPatch: function(filenames) {
    },

    
    execute: (patchFile, helpers, settings, locals) => ({
        initialize: function() {
            let {GetFlag, GetReferencedBy, Signature} = xelib;

        let isReferencedBy = function(rec, sig) {
            return GetReferencedBy(rec).some(ref => Signature(ref) === sig);
            };

        locals.books = helpers.loadRecords('BOOK').filter(rec => {
            return GetFlag(rec, 'DATA\\Flags', 'Teaches Spell') && 
                isReferencedBy(rec, 'LVLI');
    });
            
        },
        
        process: [{
            load: {
                signature: 'NPC',
                filter: function(record) {
                    raceRecord = xelib.GetLinksTo(record, 'RNAM');
                    try {
                        let raceRecord = xelib.GetWinningOverride(raceRecord);
                        let equipFlags = xelib.GetEnabledFlags(record, 'VNAM - Equipment Flags');
                        return equipFlags.includes('Spell');
                    } catch (err) {
                        helpers.logMessage('fill me in');
                        return false;
                    
                    }
                }
            },
            patch: function(record) {
                let getMagicSkillValues = function(npc) {
                    let skillValuesElement = xelib.GetElement(npc, 'DNAM\\Skill Values');
                    return {
                      Destruction: xelib.GetIntValue(skillValuesElement, 'Destruction'),
                      Illusion: xelib.GetIntValue(skillValuesElement, 'Illusion'),
                      Conjuration: xelib.GetIntValue(skillValuesElement, 'Conjuration'),
                      Alteration: xelib.GetIntValue(skillValuesElement, 'Alteration')
                    }
                  };
            }
        }],
        finalize: function() {
            
            helpers.logMessage(`Found ${locals.weapons.length} cached weapons records.`);
            
            let weapon  = xelib.AddElement(patchFile, 'WEAP\\WEAP');
            helpers.cacheRecord(weapon, 'MEPz_BlankWeapon');
            xelib.AddElementValue(weapon, 'FULL', 'Blank Weapon');
        }
    })
});