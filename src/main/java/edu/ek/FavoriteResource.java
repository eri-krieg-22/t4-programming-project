package edu.ek;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;


@Path("/api/favorite")
@ApplicationScoped
@RolesAllowed("user")

public class FavoriteResource {
    @POST
    @Transactional
    public Response addFavorite(Favorite favorite, @Context SecurityContext securityContext) {
        User currentUser = User.findByName(securityContext.getUserPrincipal().getName());
        if (currentUser == null) {
            return Response.status(401).build();
        }
        favorite.user = currentUser;
        favorite.persist();
        return Response.status(201).build();
    }

    @GET
    public Response listFavorites(@Context SecurityContext securityContext) {
        User currentUser = User.findByName(securityContext.getUserPrincipal().getName());
        if (currentUser == null) {
            return Response.status(401).build();
        }
        return Response.ok(currentUser.getFavorites()).build();
    }
}
