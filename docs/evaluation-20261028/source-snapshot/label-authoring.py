import json,hashlib,datetime,pathlib
p=pathlib.Path(__file__).parent
rows=[]
def add(category,query,ids,premise,rationale):
 rows.append(dict(id=f'Q{len(rows)+1:02}',category=category,query=query,relevant_record_ids=ids.split() if ids else [],premise_support=premise,label_rationale=rationale))
for q,ids,r in [
 ('What is causing the low hum in the turbine hall?','M01','Worn fan bearing and uneven rotation.'),
 ('Why does the relay clock restart the maintenance chime every night?','M02','Power loss and discharging capacitor.'),
 ('What triggered the recorded three-note sound with nobody on shift?','M03','Automatic relay reboot triggered the recording.'),
 ('Why do the corridor lamps flicker?','M04','Rainwater and shorted lighting circuit.'),
 ('Whose boot prints were beside the locked entrance?','M05','Inspection team technicians.'),
 ('Why is the pressure needle stuck at forty kilopascals?','M06','Blocked sensing tube.'),
 ('How was the recurring nighttime alarm fixed?','M07','Capacitor replacement; original hard query retained verbatim. Alarm paraphrases chime.'),
 ('Why are there no personnel files from before 1987?','M08','Earlier files never transferred; no occupancy records in this archive.')]: add('ordinary',q,ids,'supported',r)
for q,ids,r in [
 ('Which record was written first?','M01','Earliest record timestamp, not earliest event inferred from text.'),
 ('Which record was written last?','M07','Latest timestamp October 31; record order is not date order.'),
 ('What was recorded on October 28 at 14:00?','M08','Timestamp identifies archive coverage note.'),
 ('What did the October 27 noon entry report?','M05','Timestamp identifies inspection team boot prints.'),
 ('What was documented immediately before the October 27 pressure-gauge entry?','M05','Previous record timestamp is noon that day.'),
 ('What was the next recorded entry after the corridor speaker note?','M04','Next timestamp October 26 at 09:00.'),
 ('What evidence reports the three nights after the capacitor replacement?','M07','Retrospective maintenance note; exact replacement date not asserted.'),
 ('Which two entries were recorded at 02:13 on consecutive dates?','M02 M03','October 25 and October 26 timestamp metadata.')]: add('temporal',q,ids,'supported',r)
for q,ids,r in [
 ('What caused the nightly reset, and what stopped it?','M02 M07','Cause and subsequent intervention require two records.'),
 ('How are the relay reboot and the unattended speaker recording connected?','M02 M03','Clock/capacitor mechanism and speaker observation.'),
 ('What links the roof leak with the technicians visiting?','M04 M05','Roof seal damage and inspection of roof damage.'),
 ('What mechanical faults explain both the humming fan and stuck gauge?','M01 M06','Distinct mechanical faults.'),
 ('Compare the corridor lighting fault with the cause of the three-note chime.','M03 M04','Two independent explanations.'),
 ('What evidence describes the chime before and after the capacitor replacement?','M02 M03 M07','Cause, observed playback, and follow-up.'),
 ('What did the two October 27 entries say about prints and pressure?','M05 M06','Both entries requested explicitly.'),
 ('What explains the humming hall and why earlier personnel history cannot be checked?','M01 M08','Two unrelated but answerable archive topics.')]: add('multi-record',q,ids,'supported',r)
for q,ids,premise,r in [
 ('Why did a ghost sing through the corridor speaker?','M03','contradicted','Recording triggered by automatic relay, not a ghost.'),
 ('How did the intruder leave fresh boot prints by the locked entrance?','M05','contradicted','Prints attributed to inspection team, not an intruder.'),
 ('Why does the archive prove nobody occupied the building before 1987?','M08','unsupported','Missing occupancy records cannot establish absence of occupants.'),
 ('How did replacing the fan bearing stop the nightly relay resets?','M01 M07','contradicted','Documented reset intervention is capacitor replacement, not fan bearing.'),
 ('Which technician deliberately sabotaged the corridor lighting?','M04 M05','unsupported','Leak explains short; technicians inspected roof. No intentional sabotage or named culprit.'),
 ('Why did the pressure gauge show zero after the sensing tube was cleared?','M06','unsupported','Only blocked tube and stuck forty reading documented; no clearing or later zero reading.'),
 ('What proves the maintenance chimes never returned at any later time?','M07','unsupported','Follow-up limited to three nights, not all future time.'),
 ('How did the October 28 note confirm that the capacitor replacement had already been monitored for three nights?','M07 M08','contradicted','October 28 record concerns missing files; capacitor follow-up note dated October 31.')]: add('misleading-premise',q,ids,premise,r)
for q in ['How do I bake sourdough bread?','Who won the 1998 football World Cup?','What is the exchange rate for euros today?','How do I train a puppy to sit?','Which planet has the most moons?','Give me a recipe for chocolate ice cream.','How do I renew my passport?','What is the best hiking trail in Patagonia?']: add('unrelated',q,'','out-of-domain','No relevant evidence in these eight fictional records.')
artifact={'schema_version':1,'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'purpose':'New pre-labeled diagnostic set, not reconstruction of lost 48-query evaluation. Labels fixed before inference. Hand-authored by evaluating agent; not independently adjudicated.','label_policy':'Relevant records answer supported questions or supply pertinent correction/context for misleading premises. Retrieval recall does not measure premise confirmation. Temporal targets use record timestamps, not inferred event dates.','queries':rows}
b=json.dumps(artifact,indent=2,ensure_ascii=False).encode()+b'\n';(p/'queries.json').write_bytes(b);(p/'PRELABEL-SHA256.txt').write_text(hashlib.sha256(b).hexdigest()+'  queries.json\n')
