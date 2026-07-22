import { describe,expect,it } from "vitest"; import { POST } from "./route";
describe("media signing route",()=>{it("rejects requests without Firebase token",async()=>{const response=await POST(new Request("http://localhost/api/media/sign",{method:"POST",body:JSON.stringify({lotId:"l1",observationId:"o1",mimeType:"image/jpeg",bytes:10})}));expect(response.status).toBe(401)})});
