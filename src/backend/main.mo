import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  type PhotoRecord = {
    blob : Storage.ExternalBlob;
    latitude : Float;
    longitude : Float;
    altitude : Float;
    timestamp : Int;
    dateString : Text;
    technicianName : Text;
  };

  module PhotoRecord {
    public func compare(record1 : PhotoRecord, record2 : PhotoRecord) : { #less; #equal; #greater } {
      Int.compare(record2.timestamp, record1.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let photoRecords = Map.empty<Text, PhotoRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addPhotoRecord(id : Text, photo : PhotoRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photo records");
    };
    if (photoRecords.containsKey(id)) {
      Runtime.trap("Photo record with this id already exists");
    };
    photoRecords.add(id, photo);
  };

  public query ({ caller }) func getPhotoRecords() : async [PhotoRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photo records");
    };
    photoRecords.values().toArray().sort();
  };

  public shared ({ caller }) func deletePhotoRecord(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete photo records");
    };
    if (not photoRecords.containsKey(id)) {
      Runtime.trap("Photo record does not exist");
    };
    photoRecords.remove(id);
  };
};
