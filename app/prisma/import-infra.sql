insert into public.canyon_next_infra_config (id, name, value, "createdOn", "updatedOn", "isEncrypted", "lastSyncedEnvFileValue")
values  ('BETTER_AUTH_SECRET', 'Better Auth 签名密钥', 'replace-with-a-random-secret', '1970-01-01 00:00:00.001', '2026-04-23 17:15:03.000', false, null),
        ('BETTER_AUTH_URL', 'Better Auth 服务地址', 'http://localhost:3000', '1970-01-01 00:00:00.000', '2026-04-23 17:15:02.000', false, null),
        ('BETTER_AUTH_TRUSTED_ORIGIN', 'Better Auth 可信来源', 'http://localhost:3000', '1970-01-01 00:00:00.000', '2026-04-23 17:15:01.000', false, null),
        ('GITLAB_CLIENT_ID', 'GITLAB_CLIENT_ID', '111', '2025-11-07 07:18:12.189', '2025-11-07 15:17:59.795', false, '1'),
        ('GITLAB_CLIENT_SECRET', 'GITLAB_CLIENT_SECRET', '222', '2025-11-07 07:18:12.189', '2025-11-07 15:18:00.383', false, '1'),
        ('GITLAB_BASE_URL', 'GITLAB_BASE_URL', 'http://git.xxx.com', '2026-04-27 15:10:32.000', '2025-11-07 07:18:12.189', false, 'false'),
        ('GITLAB_PRIVATE_TOKEN', 'GITLAB_PRIVATE_TOKEN', 'xxx', '2025-11-08 10:24:55.576', '2025-11-08 10:24:56.619', false, '1');
