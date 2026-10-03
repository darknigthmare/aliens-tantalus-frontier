// Public publishable key only. RLS + CAS RPC protect account ownership.
export const CLOUD_CONFIG_V119 = Object.freeze({
  url: 'https://hykklcvvwjwhcvukbzts.supabase.co',
  key: 'sb_publishable_hAcM5bQMkl9a0wn7tgzupg_DeSgYQZC',
  sdkVersion: '2.117.2'
});
export function createCloudClientV119(factory = globalThis.supabase?.createClient) {
  if (!factory) throw new Error('Module de connexion indisponible. Les profils locaux restent accessibles.');
  return factory(CLOUD_CONFIG_V119.url, CLOUD_CONFIG_V119.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'atf-auth-v119' }
  });
}
export function createSaveTransportV119(client) {
  return {
    async pull() {
      const { data, error } = await client.from('atf_game_saves').select('*').order('slot');
      if (error) throw error;
      return data || [];
    },
    async put({ slot, revision, previousChecksum, payload, checksum, deviceId }) {
      const { data, error } = await client.rpc('atf_put_save_v119', {
        p_slot: slot, p_expected_revision: revision, p_expected_checksum: previousChecksum,
        p_payload: payload, p_checksum: checksum, p_device_id: deviceId
      });
      if (error) throw error;
      return data;
    }
  };
}
