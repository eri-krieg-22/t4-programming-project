package edu.ek;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.Objects;

@Path("/api/user")
@ApplicationScoped

public class UserResource {
    @GET
    @RolesAllowed("user")
    @Produces("text/plain")
    public Response currentUser(@Context SecurityContext securityContext) {
        User currentUser = User.findByName(securityContext.getUserPrincipal().getName());
        return Response.ok(currentUser.username).build();
    }

    @POST
    @Transactional
    public Response addUser(User user) {
        User existingUser = User.findByName(user.username);
        if (existingUser != null) {
            return Response.status(400).build();
        } else if (Objects.equals(user.username, "") || Objects.equals(user.password, "")) {
            return Response.status(401).build();
        } else {
            User.add(user.username, user.password, "user");
            return Response.status(200).build();
        }
    }
}
