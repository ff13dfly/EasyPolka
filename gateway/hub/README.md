# Gateway Hub

## Security

- If the `Hub` address is exposed, mock vService can hack in to get the customer request.
    1. `Hub` strick mode, whitelist of vService. Can check the `trust` or `auth` account.
    2. `Hub` will check the response of vService.  Not good, cost much resource to do this.
    3. `Hub` will check the parameters by following the details anchor.

- Question: how to verify the node, both `Hub` and `vService`.
- The security is in hand of `Hub`. The `Hub` can test the `vService` exposed method to check wether it works properly. ( If node want to cheat `Hub`, it can response correctly. Still security problem. )

- Two ways to run, one is anonymous, one is account.

## Setting

- You can run the node by the command as follow:

    ```SHELL
        node hub.js config.json
    ```

- Sample of config.json.

## Workflow

### Way 1, vService voluntary

1. `vService` request `Hub.reg`, sent a temp secret to encry JWT. (Mock attack ?)
2. `Hub` request `vService.handshake` by JWT of setp1 secret. `vService.handshake` response service details by JWT with the new secret which is include in the request.

### Way 2, Hub voluntary

1. `Hub` request `vService.knock`, sent a temp `secret` and vService definition `Anchor` to encry JWT. `vService` response with JWT and wether follow the definition. `Hub` will check the details valid.

    ```JSON
        {
            "name":"vname",               //vService name, the same name will be treated as the same service
            "anchor":"details_anchor",    //Service methods defined on anchor
            "instance":"",                //name of running node
            "account":"",                 //running owner, can check from `Hub` to confirm the authority
            "salt":""                     //running salt
        }
    ```

2. `Hub` request `vService.reg`, sent new secret to `vService`, link to `vService` successful.
