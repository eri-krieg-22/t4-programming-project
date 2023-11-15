package edu.ek;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import static java.lang.Long.valueOf;


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
        return Response.status(201).entity(favorite).build();
    }
    @DELETE
    @Transactional
    @Consumes("text/plain")
    public Response removeFavorite(Long id, @Context SecurityContext securityContext) {
        User currentUser = User.findByName(securityContext.getUserPrincipal().getName());
        if (currentUser == null) {
            return Response.status(401).build();
        }
        Favorite.deleteEntitybyId(id);
        return Response.status(200).entity("TEST" + id).build();

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
